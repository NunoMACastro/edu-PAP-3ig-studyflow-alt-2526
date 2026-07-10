/**
 * Implementa as regras de negócio de IA coletiva do grupo e concentra validações do domínio.
 */
import {
    HttpException,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import {
    RoomSharesService,
    RoomShareSource,
} from "../study-rooms/room-shares.service.js";
import { StudyGroupsService } from "../study-groups/study-groups.service.js";
import { AskStudyGroupAiDto } from "./dto/ask-study-group-ai.dto.js";
import {
    StudyGroupAiAnswer,
    StudyGroupAiAnswerDocument,
    StudyGroupAiSource,
} from "./schemas/study-group-ai-answer.schema.js";

/**
 * Vista pública de IA coletiva do grupo, sem detalhes internos de Mongoose.
 */
export type StudyGroupAiAnswerView = {
    _id: string;
    groupId: string;
    question: string;
    answer: string;
    sources: StudyGroupAiSource[];
    createdAt?: Date;
};

/**
 * Serviço da IA coletiva baseada em fontes partilhadas.
 */
@Injectable()
export class StudyGroupAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param answerModel Modelo Mongoose injetado para ler e persistir IA coletiva do grupo.
     * @param studyGroupsService Service injetado para reutilizar regras de grupos de estudo sem duplicar validações.
     * @param roomSharesService Service injetado para reutilizar regras de sala shares sem duplicar validações.
     * @param aiExecution Fachada obrigatória de consentimento, política, quota e provider.
     * @param auditLogService Service injetado para auditar uso IA minimizado por grupo.
     */
    constructor(
        @InjectModel(StudyGroupAiAnswer.name)
        private readonly answerModel: Model<StudyGroupAiAnswerDocument>,
        private readonly studyGroupsService: StudyGroupsService,
        private readonly roomSharesService: RoomSharesService,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Responde a uma pergunta coletiva usando apenas partilhas processáveis.
     *
     * @param actor Aluno autenticado.
     * @param groupId Grupo alvo.
     * @param input Pergunta e fontes opcionais.
     * @returns Resposta guardada com fontes.
     * @throws UnprocessableEntityException quando não há fontes partilhadas.
     * @throws ServiceUnavailableException quando o provider falha ou devolve output inválido.
     */
    async ask(
        actor: AuthenticatedUser,
        groupId: string,
        input: AskStudyGroupAiDto,
    ): Promise<StudyGroupAiAnswerView> {
        // A membership é validada antes de ler partilhas para evitar fuga de notas de outros grupos.
        await this.studyGroupsService.ensureMember(actor.id, groupId);
        const sources = await this.roomSharesService.findUsableSharesForRoom(
            actor.id,
            groupId,
            input.sourceShareIds,
        );

        if (sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_GROUP_AI_SOURCES",
                message: "Este grupo ainda não tem fontes partilhadas processáveis.",
            });
        }

        const authorization = await this.aiExecution.authorize(actor.id, "GROUP_AI");
        const policy = authorization.policy;
        const selected = sources.slice(0, policy.maxSourceCount);

        try {
            const execution = await this.aiExecution.executeAuthorized(
                authorization,
                {
                    quota: {
                        scope: "GROUP",
                        targetId: groupId,
                        units: (prompt) => this.estimateUsageUnits(prompt),
                    },
                    sources: selected,
                    guardrailText: input.question,
                    buildPrompt: (limitedSources) =>
                        this.buildPrompt(input.question, [...limitedSources]),
                    invoke: ({ provider, prompt, options }) =>
                        provider.generateStudyTool({
                            prompt,
                            type: "EXPLANATION",
                            options,
                        }),
                    validateResult: (result) => {
                        if (
                            typeof result.answer !== "string" ||
                            result.answer.trim().length === 0
                        ) {
                            throw new ServiceUnavailableException({
                                code: "AI_PROVIDER_INVALID_RESPONSE",
                                message: "A IA devolveu uma resposta inválida.",
                            });
                        }
                    },
                },
            );
            const providerResult = execution.result;
            const answer = providerResult.answer;
            if (typeof answer !== "string" || answer.trim().length === 0) {
                throw new ServiceUnavailableException({
                    code: "AI_PROVIDER_INVALID_RESPONSE",
                    message: "A IA devolveu uma resposta inválida.",
                });
            }
            const selectedSources = [...execution.sources];
            const document = await this.answerModel.create({
                groupId: new Types.ObjectId(groupId),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: answer.trim(),
                sources: selectedSources.map((source) => ({
                    shareId: source.shareId,
                    title: source.title,
                })),
            });
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "GROUP_AI_REQUESTED",
                resourceType: "StudyGroup",
                resourceId: groupId,
                result: "SUCCESS",
                metadata: {
                    purpose: "GROUP_AI",
                    model: policy.model,
                    sourceCount: selectedSources.length,
                },
            });
            const created = document.toObject() as { createdAt?: Date };
            return {
                _id: String(document._id),
                groupId,
                question: document.question,
                answer: document.answer,
                sources: document.sources,
                createdAt: created.createdAt,
            };
        } catch (error) {
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "GROUP_AI_REQUESTED",
                resourceType: "StudyGroup",
                resourceId: groupId,
                result: "FAILED",
                metadata: {
                    purpose: "GROUP_AI",
                    model: policy.model,
                    sourceCount: selected.length,
                },
            });
            if (error instanceof HttpException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /**
     * Constrói build prompt no domínio de IA de grupos de estudo, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param question Valor de question usado pela função para executar build prompt com dados explícitos.
     * @param sources Valor de sources usado pela função para executar build prompt com dados explícitos.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private buildPrompt(question: string, sources: RoomShareSource[]): string {
        const prompt = [
            "Responde em português de Portugal.",
            "Age como IA coletiva de grupo e usa apenas fontes partilhadas autorizadas.",
            `Pergunta do grupo: ${question.trim()}`,
            "Fontes partilhadas:",
            sources
                .map(
                    (source, index) =>
                        `Fonte ${index + 1} (${source.shareId}, ${source.title}): ${source.contentText.trim().slice(0, 420)}`,
                )
                .join("\n"),
            "Devolve JSON com a chave answer.",
        ].join("\n");

        return prompt;
    }

    /**
     * Executa estimate usage units no domínio de IA de grupos de estudo, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param prompt Valor de prompt usado pela função para executar estimate usage units com dados explícitos.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    private estimateUsageUnits(prompt: string): number {
        return Math.max(1, Math.ceil(prompt.length / 1000));
    }
}
