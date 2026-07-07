/**
 * Implementa as regras de negócio de ai e concentra validações do domínio.
 */
import {
    BadGatewayException,
    BadRequestException,
    GatewayTimeoutException,
    Inject,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
    UnprocessableEntityException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HistoryService } from "../study/history.service.js";
import { MaterialsService } from "../materials/materials.service.js";
import { StudyAreasService } from "../study-areas/study-areas.service.js";
import { AiAreaProfileService } from "./ai-area-profile.service.js";
import {
    CreateStudyToolDto,
    STUDY_TOOL_TYPES,
    StudyToolType,
} from "./dto/create-study-tool.dto.js";
import { toAiArtifactDto } from "./dto/ai-artifact.dto.js";
import { CreateQuizAttemptDto } from "./dto/create-quiz-attempt.dto.js";
import {
    QuizAttemptQuestionResultDto,
    toQuizAttemptResultDto,
} from "./dto/quiz-attempt.dto.js";
import { buildStudyToolPrompt } from "./prompts/study-tools.prompt.js";
import { AI_PROVIDER, AiProvider, AiSource } from "./providers/ai-provider.js";
import {
    AiArtifact,
    AiArtifactDocument,
} from "./schemas/ai-artifact.schema.js";
import {
    AiQuizAttempt,
    AiQuizAttemptDocument,
} from "./schemas/ai-quiz-attempt.schema.js";
import { validateStudyToolArtifact } from "./validators/ai-artifact.validator.js";

/**
 * Contrato de artefactos de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type QuizQuestion = {
    correctOptionIndex: number;
    options?: unknown[];
    sourceMaterialIds?: string[];
};

/**
 * Serviço de explicações, flashcards e quizzes personalizados.
 */
@Injectable()
export class StudyToolsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param artifactModel Modelo Mongoose injetado para ler e persistir artefactos de IA.
     * @param quizAttemptModel Modelo Mongoose injetado para ler e persistir artefactos de IA.
     * @param aiProvider Provider injetado para isolar integração externa e facilitar testes.
     * @param materialsService Service injetado para reutilizar regras de materiais sem duplicar validações.
     * @param areasService Service injetado para reutilizar regras de areas sem duplicar validações.
     * @param profileService Service injetado para reutilizar regras de profile sem duplicar validações.
     * @param historyService Service injetado para reutilizar regras de history sem duplicar validações.
     */
    constructor(
        @InjectModel(AiArtifact.name)
        private readonly artifactModel: Model<AiArtifactDocument>,
        @InjectModel(AiQuizAttempt.name)
        private readonly quizAttemptModel: Model<AiQuizAttemptDocument>,
        @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
        private readonly materialsService: MaterialsService,
        private readonly areasService: StudyAreasService,
        private readonly profileService: AiAreaProfileService,
        private readonly historyService: HistoryService,
    ) {}

    /**
     * Lista ferramentas de estudo já geradas.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param type Tipo opcional para filtrar.
     * @returns Artefactos IA da área.
     */
    async listTools(userId: string, studyAreaId: string, type?: string) {
        const validatedType = this.validateOptionalStudyToolType(type);
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        const query: Record<string, unknown> = {
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            type: { $in: ["EXPLANATION", "FLASHCARDS", "QUIZ"] },
        };
        if (validatedType) query.type = validatedType;
        const artifacts = await this.artifactModel
            .find(query)
            .sort({ createdAt: -1 })
            .lean();
        return artifacts.map((artifact) => toAiArtifactDto(artifact));
    }

    /**
     * Gera uma ferramenta de estudo baseada nas fontes da área.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param input Pedido de ferramenta.
     * @returns Artefacto criado.
     */
    async generateStudyTool(
        userId: string,
        studyAreaId: string,
        input: CreateStudyToolDto,
    ) {
        const type = this.validateRequiredStudyToolType(input.type);

        const area = await this.areasService.getMyStudyArea(userId, studyAreaId);
        const profile = await this.profileService.prepareProfile(
            userId,
            studyAreaId,
        );
        const sources = await this.getProcessableSources(userId, studyAreaId);

        if (profile.status !== "READY_FOR_GENERATION" || sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PROCESSABLE_SOURCES",
                message:
                    "Este material ainda não tem texto processável para gerar conteúdo de estudo.",
            });
        }

        try {
            const contentJson = await this.aiProvider.generateStudyTool({
                type,
                prompt: buildStudyToolPrompt({
                    areaName: area.name,
                    type,
                    topic: input.topic,
                    voiceTone: profile.voiceTone,
                    sources,
                }),
            });

            const sourceMaterialIds = sources.map(({ materialId }) => materialId);
            validateStudyToolArtifact(type, contentJson, sourceMaterialIds);

            const artifact = await this.artifactModel.create({
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
                type,
                contentJson,
                sourcesJson: sources.map(({ materialId, title }) => ({
                    materialId,
                    title,
                })),
            });

            await this.historyService.recordEvent(
                userId,
                "STUDY_TOOL_GENERATED",
                "Ferramenta de estudo gerada",
                type,
            );

            return toAiArtifactDto(artifact);
        } catch (error) {
            if (
                error instanceof BadGatewayException ||
                error instanceof BadRequestException ||
                error instanceof GatewayTimeoutException ||
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
     * Confirma que a área privada tem condições mínimas para iniciar um job de quiz.
     *
     * @param userId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param studyAreaId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async assertQuizGenerationReady(
        userId: string,
        studyAreaId: string,
    ): Promise<void> {
        // A validação reutiliza services reais para bloquear áreas de outro aluno antes de criar job.
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        const profile = await this.profileService.prepareProfile(userId, studyAreaId);
        const sources = await this.getProcessableSources(userId, studyAreaId);

        if (profile.status !== "READY_FOR_GENERATION" || sources.length === 0) {
            throw new UnprocessableEntityException({
                code: "NO_PROCESSABLE_SOURCES",
                message:
                    "Este material ainda não tem texto processável para gerar conteúdo de estudo.",
            });
        }
    }

    /**
     * Regista respostas do aluno num quiz gerado pela IA.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @param artifactId Identificador do artefacto `QUIZ`.
     * @param input Respostas escolhidas pelo aluno.
     * @returns Resultado público da tentativa.
     */
    async submitQuizAttempt(
        userId: string,
        studyAreaId: string,
        artifactId: string,
        input: CreateQuizAttemptDto,
    ) {
        await this.areasService.getMyStudyArea(userId, studyAreaId);
        if (!Types.ObjectId.isValid(artifactId)) {
            throw this.artifactNotFound();
        }

        const artifact = await this.artifactModel
            .findOne({
                _id: artifactId,
                userId: new Types.ObjectId(userId),
                studyAreaId: new Types.ObjectId(studyAreaId),
            })
            .lean();
        if (!artifact) throw this.artifactNotFound();
        if (artifact.type !== "QUIZ") {
            throw new UnprocessableEntityException({
                code: "ARTIFACT_IS_NOT_QUIZ",
                message: "Este artefacto não é um quiz.",
            });
        }

        const questions = this.getQuizQuestions(artifact.contentJson);
        this.validateQuizAttemptAnswers(input.answers, questions.length);
        const results = this.buildQuizAttemptResults(input.answers, questions);
        const correctCount = results.filter((result) => result.isCorrect).length;
        const answeredAt = new Date();

        const attempt = await this.quizAttemptModel.create({
            userId: new Types.ObjectId(userId),
            studyAreaId: new Types.ObjectId(studyAreaId),
            artifactId: new Types.ObjectId(artifactId),
            answers: input.answers,
            correctCount,
            totalQuestions: questions.length,
            scorePercent: Math.round((correctCount / questions.length) * 100),
            answeredAt,
            results,
        });

        await this.historyService.recordEvent(
            userId,
            "QUIZ_ATTEMPT_RECORDED",
            "Quiz realizado",
            `${correctCount}/${questions.length}`,
        );

        return toQuizAttemptResultDto(attempt);
    }

    /**
     * Obtém fontes textuais prontas.
     *
     * @param userId Identificador vindo da sessão.
     * @param studyAreaId Identificador da área.
     * @returns Fontes no contrato do provider.
     */
    private async getProcessableSources(
        userId: string,
        studyAreaId: string,
    ): Promise<AiSource[]> {
        const materials = await this.materialsService.listReadyTextSources(
            userId,
            studyAreaId,
        );
        return materials.map((material) => ({
            materialId: String(material._id),
            title: material.title,
            contentText: material.contentText!,
        }));
    }

    /**
     * Valida o tipo canónico de ferramenta de estudo.
     *
     * @param type Tipo recebido por body ou query.
     * @returns Tipo validado ou `undefined` quando não há filtro.
     */
    private validateOptionalStudyToolType(type?: unknown): StudyToolType | undefined {
        if (type === undefined) return undefined;
        if (typeof type === "string" && STUDY_TOOL_TYPES.includes(type as StudyToolType)) {
            return type as StudyToolType;
        }
        this.invalidStudyToolType();
    }

    /**
     * Valida o tipo obrigatório recebido na geração de ferramenta.
     *
     * @param type Tipo recebido no body.
     * @returns Tipo canónico validado.
     */
    private validateRequiredStudyToolType(type: unknown): StudyToolType {
        const validatedType = this.validateOptionalStudyToolType(type);
        if (validatedType) return validatedType;
        this.invalidStudyToolType();
    }

    /**
     * Cria o erro público para tipo de ferramenta inválido.
     *
     * @returns Nunca retorna; lança exceção.
     */
    private invalidStudyToolType(): never {
        throw new BadRequestException({
            code: "INVALID_STUDY_TOOL_TYPE",
            message: "Tipo de ferramenta inválido.",
        });
    }

    /**
     * Lê perguntas persistidas no artefacto de quiz.
     *
     * @param content Conteúdo JSON do artefacto.
     * @returns Perguntas do quiz.
     */
    private getQuizQuestions(content: Record<string, unknown>): QuizQuestion[] {
        const questions = content.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new BadRequestException({
                code: "INVALID_QUIZ_ATTEMPT",
                message: "O quiz não tem perguntas válidas.",
            });
        }
        const quizQuestions = questions as QuizQuestion[];
        if (
            !quizQuestions.every(
                (question) =>
                    Number.isInteger(question.correctOptionIndex) &&
                    question.correctOptionIndex >= 0 &&
                    question.correctOptionIndex <= 3 &&
                    Array.isArray(question.options) &&
                    question.options.length === 4,
            )
        ) {
            throw new BadRequestException({
                code: "INVALID_QUIZ_ATTEMPT",
                message: "O quiz não tem perguntas válidas.",
            });
        }
        return quizQuestions;
    }

    /**
     * Valida respostas recebidas para a tentativa.
     *
     * @param answers Respostas escolhidas pelo aluno.
     * @param expectedLength Número de perguntas do quiz.
     * @returns Nada quando o payload é válido.
     */
    private validateQuizAttemptAnswers(
        answers: unknown,
        expectedLength: number,
    ): asserts answers is number[] {
        if (
            !Array.isArray(answers) ||
            answers.length !== expectedLength ||
            !answers.every(
                (answer) =>
                    Number.isInteger(answer) && answer >= 0 && answer <= 3,
            )
        ) {
            throw new BadRequestException({
                code: "INVALID_QUIZ_ATTEMPT",
                message: "Responde a todas as perguntas com uma opção válida.",
            });
        }
    }

    /**
     * Calcula o resultado por pergunta.
     *
     * @param answers Respostas escolhidas pelo aluno.
     * @param questions Perguntas persistidas no artefacto.
     * @returns Resultados individuais.
     */
    private buildQuizAttemptResults(
        answers: number[],
        questions: QuizQuestion[],
    ): QuizAttemptQuestionResultDto[] {
        return questions.map((question, questionIndex) => ({
            questionIndex,
            selectedOptionIndex: answers[questionIndex],
            correctOptionIndex: question.correctOptionIndex,
            isCorrect: answers[questionIndex] === question.correctOptionIndex,
            sourceMaterialIds: question.sourceMaterialIds ?? [],
        }));
    }

    /**
     * Cria erro de artefacto inexistente ou inacessível.
     *
     * @returns Exceção pública.
     */
    private artifactNotFound(): NotFoundException {
        return new NotFoundException({
            code: "AI_ARTIFACT_NOT_FOUND",
            message: "Artefacto IA não encontrado.",
        });
    }
}
