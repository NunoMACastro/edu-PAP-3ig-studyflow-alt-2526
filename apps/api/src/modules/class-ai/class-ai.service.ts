/**
 * Implementa as regras de negócio de turma ai e concentra validações do domínio.
 */
import {
    ForbiddenException,
    GatewayTimeoutException,
    Inject,
    Injectable,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AI_PROVIDER, AiProvider, ClassAiResult } from "../ai/providers/ai-provider.js";
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
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     * @param subjectsService Service injetado para reutilizar regras de disciplinas sem duplicar validações.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param voiceService Service injetado para reutilizar regras de voice sem duplicar validações.
     */
    constructor(
        @InjectModel(ClassAiInteraction.name)
        private readonly interactionModel: Model<ClassAiInteractionDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly subjectsService: SubjectsService,
        private readonly materialsService: OfficialMaterialsService,
        private readonly voiceService: TeacherAiVoiceService,
    ) {}

    /**
     * Orquestra uma pergunta de IA em IA da disciplina, limitando contexto e validando a resposta antes de a devolver.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @param input Dados de entrada já tipados pelo contrato público desta operação.
     * @returns Resposta validada, limitada às fontes e pronta para persistência ou apresentação.
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

        // A inscrição na disciplina é validada antes de qualquer material oficial ser exposto ao aluno.
        const { subject, schoolClass } =
            await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
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

        const voice = await this.voiceService.findVoiceForSubject(subject._id);

        try {
            // O prompt recebe apenas materiais oficiais processados e a voz configurada pelo professor.
            const result = await this.aiProvider.generateClassAnswer({
                prompt: buildClassAiPrompt({
                    subjectName: subject.name,
                    question: input.question.trim(),
                    materials,
                    voice,
                }),
            });
            // A resposta só é aceite se citar materiais oficiais permitidos para esta disciplina.
            this.validateResult(result, materials);

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
            });

            const created = interaction.toObject() as { createdAt?: Date };
            return {
                _id: String(interaction._id),
                subjectId: subject._id,
                classId: schoolClass._id,
                question: interaction.question,
                answer: interaction.answer,
                voiceRulesApplied: interaction.voiceRulesApplied,
                sources: materials.filter((material) =>
                    result.sourceMaterialIds.includes(material._id),
                ),
                createdAt: created.createdAt,
            };
        } catch (error) {
            if (
                error instanceof GatewayTimeoutException ||
                error instanceof ServiceUnavailableException ||
                error instanceof UnprocessableEntityException
            ) {
                throw error;
            }
            throw new ServiceUnavailableException({
                code: "AI_PROVIDER_UNAVAILABLE",
                message: "A IA está temporariamente indisponível.",
            });
        }
    }

    /**
     * Confirma que os dados de IA da disciplina cumprem o contrato antes de serem persistidos ou apresentados.
     *
     * @param result result necessário para executar validate result sem depender de estado global.
     * @param materials Fontes já autorizadas que limitam a resposta e evitam acesso a dados fora do contexto.
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
