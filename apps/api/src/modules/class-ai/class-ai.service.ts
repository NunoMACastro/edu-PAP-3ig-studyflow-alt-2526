/**
 * Implementa as regras de negócio de turma ai e concentra validações do domínio.
 */
import {
    BadRequestException,
    ForbiddenException,
    HttpException,
    Injectable,
    Optional,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import * as aiContextPolicy from "../ai/context/ai-context-policy.js";
import { GovernedAiExecutionService } from "../ai/governed-ai-execution.service.js";
import { ClassAiResult } from "../ai/providers/ai-provider.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { OfficialMaterialView, OfficialMaterialsService } from "../official-materials/official-materials.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { TeacherAiVoiceService } from "../teacher-ai/teacher-ai-voice.service.js";
import { AskClassAiDto } from "./dto/ask-class-ai.dto.js";
import { buildClassAiPrompt } from "./prompts/class-ai.prompt.js";
import {
    ClassAiInteraction,
    ClassAiInteractionDocument,
} from "./schemas/class-ai-interaction.schema.js";

/**
 * Serviço da IA limitada por disciplina/turma.
 */
@Injectable()
export class ClassAiService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param interactionModel Modelo Mongoose injetado para ler e persistir IA da disciplina.
     * @param aiExecution Fachada obrigatória de consentimento, política, quota e provider.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param voiceService Service injetado para reutilizar regras de voice sem duplicar validações.
     * @param auditLogService Service injetado para auditar chamadas IA sem copiar prompts ou respostas.
     */
    constructor(
        @InjectModel(ClassAiInteraction.name)
        private readonly interactionModel: Model<ClassAiInteractionDocument>,
        private readonly aiExecution: GovernedAiExecutionService,
        private readonly subjectsService: SubjectsService,
        private readonly materialsService: OfficialMaterialsService,
        private readonly voiceService: TeacherAiVoiceService,
        private readonly auditLogService: AuditLogService,
        @Optional()
        private readonly classLearningActivityService?: ClassLearningActivityService,
    ) {}

    /**
     * Orquestra uma pergunta de IA em IA da disciplina, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param subjectId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    async askClassAi(
        actor: AuthenticatedUser,
        subjectId: string,
        input: AskClassAiDto,
    ) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }

        // A inscrição na disciplina é validada antes de qualquer policy, voz ou material oficial.
        const { subject, schoolClass } =
            await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        aiContextPolicy.assertAiContextProfile("CLASS_SUBJECT", "TEACHER_CLASS");
        const authorization = await this.aiExecution.authorize(actor.id, "CLASS_AI");
        const policy = authorization.policy;

        const materials = await this.materialsService.listProcessedForSubject(
            subject._id,
        );
        if (materials.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_OFFICIAL_AI_SOURCES",
                message:
                    "Esta disciplina ainda não tem materiais oficiais processados para IA.",
            });
        }

        const voice = await this.voiceService.resolveTeacherVoice({
            classId: schoolClass._id,
            subjectId: subject._id,
        });
        const limitedMaterials = materials.slice(0, policy.maxSourceCount);

        try {
            const execution = await this.aiExecution.executeAuthorized(
                authorization,
                {
                    quota: {
                        scope: "CLASS",
                        targetId: String(schoolClass._id),
                        units: (prompt) => this.estimateUsageUnits(prompt),
                    },
                    sources: limitedMaterials,
                    guardrailText: input.question,
                    buildPrompt: (selectedMaterials) =>
                        buildClassAiPrompt({
                            subjectName: subject.name,
                            question: input.question.trim(),
                            materials: [...selectedMaterials],
                            voice,
                        }),
                    invoke: ({ provider, prompt, options }) =>
                        provider.generateClassAnswer({ prompt, options }),
                    validateResult: (result, selectedMaterials) =>
                        this.validateResult(result, [...selectedMaterials]),
                },
            );
            const { result } = execution;
            const selectedMaterials = [...execution.sources];
            // A resposta só é aceite se citar materiais oficiais permitidos para esta disciplina.
            this.validateResult(result, selectedMaterials);

            const interaction = await this.interactionModel.create({
                subjectId: new Types.ObjectId(subject._id),
                classId: new Types.ObjectId(schoolClass._id),
                studentId: new Types.ObjectId(actor.id),
                question: input.question.trim(),
                answer: result.answer.trim(),
                sourceMaterialIds: result.sourceMaterialIds.map(
                    (sourceId) => new Types.ObjectId(sourceId),
                ),
                voiceRulesApplied: voice.rules,
                voiceSource: voice.source,
            });

            const created = interaction.toObject() as { createdAt?: Date };
            await this.classLearningActivityService?.recordBestEffort({
                classId: String(schoolClass._id),
                studentId: actor.id,
                subjectId: String(subject._id),
                type: "CLASS_AI_INTERACTION",
                sourceEventKey: `class-ai-interaction:${String(interaction._id)}`,
                occurredAt: created.createdAt,
            });
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "CLASS_AI_REQUESTED",
                resourceType: "Subject",
                resourceId: String(subject._id),
                result: "SUCCESS",
                metadata: {
                    purpose: "CLASS_AI",
                    classId: String(schoolClass._id),
                    model: policy.model,
                    sourceCount: selectedMaterials.length,
                },
            });

            return {
                _id: String(interaction._id),
                subjectId: subject._id,
                classId: schoolClass._id,
                question: interaction.question,
                answer: interaction.answer,
                teacherVoiceApplied: voice.source !== "DEFAULT",
                sources: selectedMaterials.filter((material) =>
                    result.sourceMaterialIds.includes(material._id),
                ).map((material) => this.toStudentSource(material)),
                createdAt: created.createdAt,
            };
        } catch (error) {
            await this.auditLogService.record({
                actorId: actor.id,
                domain: "AI",
                action: "CLASS_AI_REQUESTED",
                resourceType: "Subject",
                resourceId: String(subject._id),
                result: "FAILED",
                metadata: {
                    purpose: "CLASS_AI",
                    classId: String(schoolClass._id),
                    model: policy.model,
                    sourceCount: limitedMaterials.length,
                },
            });
            if (error instanceof HttpException) throw error;
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /** Lista o histórico do aluno sem revelar regras internas da voz docente. */
    async listMyAnswers(
        actor: AuthenticatedUser,
        subjectId: string,
        cursor?: string,
        requestedLimit = 20,
    ) {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
        const { subject } = await this.subjectsService.findSubjectForStudentHistory(
            actor.id,
            subjectId,
        );
        if (cursor && !Types.ObjectId.isValid(cursor)) {
            throw new BadRequestException({
                code: "CLASS_AI_CURSOR_INVALID",
                message: "Cursor de histórico inválido.",
            });
        }
        const limit = Math.max(1, Math.min(50, Number(requestedLimit) || 20));
        const rows = await this.interactionModel
            .find({
                subjectId: new Types.ObjectId(subject._id),
                studentId: new Types.ObjectId(actor.id),
                ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
            })
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;
        const sourceIds = [
            ...new Set(pageRows.flatMap((row) => row.sourceMaterialIds.map(String))),
        ];
        const materials = sourceIds.length
            ? await this.materialsService.listByIds(sourceIds)
            : [];
        const materialById = new Map(
            materials
                .filter((material) => material.subjectId === subject._id)
                .map((material) => [material._id, material]),
        );
        return {
            items: pageRows.map((row) => ({
                _id: String(row._id),
                subjectId: String(row.subjectId),
                classId: String(row.classId),
                question: row.question,
                answer: row.answer,
                teacherVoiceApplied:
                    Boolean(row.voiceSource) && row.voiceSource !== "DEFAULT",
                sources: row.sourceMaterialIds
                    .map((id) => materialById.get(String(id)))
                    .filter((item): item is OfficialMaterialView => Boolean(item))
                    .map((material) => this.toStudentSource(material)),
                createdAt: (row as typeof row & { createdAt?: Date }).createdAt,
            })),
            nextCursor: hasMore ? String(pageRows.at(-1)?._id) : null,
        };
    }

    /** Material minimizado usado nos contratos de aluno da IA. */
    private toStudentSource(material: OfficialMaterialView) {
        return {
            _id: material._id,
            subjectId: material.subjectId,
            classId: material.classId,
            title: material.title,
            type: material.type,
            status: material.status,
            sourceUrl: material.sourceUrl,
        };
    }

    /**
     * Executa estimate usage units no domínio de IA de turma, aplicando validações, autorização e persistência de forma coesa.
     *
     * @param prompt Valor de prompt usado pela função para executar estimate usage units com dados explícitos.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    private estimateUsageUnits(prompt: string): number {
        return Math.max(1, Math.ceil(prompt.length / 1000));
    }

    /**
     * Confirma que os dados de IA da disciplina cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result Resultado devolvido por uma operação externa antes da validação final.
     * @param materials Valor de materials usado pela função para executar validate result com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private validateResult(
        result: ClassAiResult,
        materials: OfficialMaterialView[],
    ): void {
        const allowedIds = new Set(materials.map((material) => material._id));
        if (
            typeof result.answer !== "string" ||
            result.answer.trim().length === 0 ||
            !Array.isArray(result.sourceMaterialIds) ||
            result.sourceMaterialIds.length === 0 ||
            result.sourceMaterialIds.some((materialId) => !allowedIds.has(materialId))
        ) {
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_INVALID_CLASS_ANSWER",
                message: "A IA devolveu uma resposta inválida para a disciplina.",
            });
        }
    }
}
