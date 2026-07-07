/**
 * Implementa as regras de negócio de testes oficiais e concentra validações do domínio.
 */
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { SubmitOfficialTestAttemptDto } from "./dto/submit-official-test-attempt.dto.js";
import { scoreOfficialTestAttempt } from "./official-test-attempt-scoring.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptDocument,
    OfficialTestAttemptQuestionResult,
} from "./schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestDocument,
    OfficialTestQuestion,
    OfficialTestStatus,
} from "./schemas/official-test.schema.js";

/**
 * Vista pública de testes oficiais, sem detalhes internos de Mongoose.
 */
export type OfficialTestView = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    description?: string;
    status: OfficialTestStatus;
    questions: OfficialTestQuestion[];
    createdAt?: Date;
};

/**
 * Pergunta entregue ao aluno antes da submissão, sem expor a resposta correta.
 */
export type OfficialTestStudentQuestionView = Omit<
    OfficialTestQuestion,
    "correctOptionIndex"
>;

/**
 * Vista de teste publicada para alunos inscritos.
 */
export type OfficialTestStudentView = {
    _id: string;
    subjectId: string;
    title: string;
    description?: string;
    status: "PUBLISHED";
    questions: OfficialTestStudentQuestionView[];
    createdAt?: Date;
};

/**
 * Resultado persistido da tentativa oficial feita pelo aluno autenticado.
 */
export type OfficialTestAttemptView = {
    _id: string;
    testId: string;
    subjectId: string;
    classId: string;
    studentId: string;
    selectedOptionIndexes: number[];
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    results: OfficialTestAttemptQuestionResult[];
    answeredAt: Date;
};

/**
 * Serviço de testes oficiais por disciplina.
 */
@Injectable()
export class OfficialTestsService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param testModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param attemptModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param subjectsService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly testModel: Model<OfficialTestDocument>,
        @InjectModel(OfficialTestAttempt.name)
        private readonly attemptModel: Model<OfficialTestAttemptDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Cria testes oficiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @param subjectId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
     * @returns Promise com o resultado da operação depois de concluídas validações e efeitos assíncronos.
     */
    async create(
        actor: AuthenticatedUser,
        subjectId: string,
        input: CreateOfficialTestDto,
    ): Promise<OfficialTestView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const questions = input.questions.map((question) =>
            this.normalizeQuestion(question),
        );
        const test = await this.testModel.create({
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(subject.classId),
            teacherId: new Types.ObjectId(actor.id),
            title: input.title.trim(),
            description: input.description?.trim(),
            status: input.status ?? "DRAFT",
            questions,
        });
        return this.toView(test.toObject());
    }

    /**
     * Lista testes oficiais já filtrado pelo utilizador autenticado ou pela relação de turma ou sala.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param subjectId Identificador da disciplina; limita o pedido ao professor dono ou ao aluno inscrito.
     * @returns Coleção de testes oficiais visível para o contexto autorizado.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialTestView[]> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const tests = await this.testModel
            .find({ subjectId: new Types.ObjectId(subject._id) })
            .sort({ createdAt: -1 })
            .lean();
        return tests.map((test) => this.toView(test));
    }

    /**
     * Lista testes publicados para o aluno inscrito, ocultando respostas corretas.
     *
     * @param actor Utilizador autenticado vindo da sessão; nunca vem do body.
     * @param subjectId Disciplina oficial pedida no URL.
     * @returns Testes publicados acessíveis ao aluno autenticado.
     */
    async listPublishedForStudent(
        actor: AuthenticatedUser,
        subjectId: string,
    ): Promise<OfficialTestStudentView[]> {
        this.assertStudent(actor);
        const { subject } = await this.subjectsService.findSubjectForStudent(
            actor.id,
            subjectId,
        );
        const tests = await this.testModel
            .find({
                subjectId: new Types.ObjectId(subject._id),
                status: "PUBLISHED",
            })
            .sort({ createdAt: -1 })
            .lean();
        return tests.map((test) => this.toStudentView(test));
    }

    /**
     * Submete respostas de aluno e persiste uma tentativa separada da prova oficial.
     *
     * @param actor Utilizador autenticado; define o `studentId` real da tentativa.
     * @param subjectId Disciplina oficial pedida no URL.
     * @param testId Teste oficial publicado.
     * @param input Respostas escolhidas no formulário.
     * @returns Tentativa persistida com pontuação calculada no backend.
     */
    async submitAttempt(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
        input: SubmitOfficialTestAttemptDto,
    ): Promise<OfficialTestAttemptView> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(testId)) throw this.testNotFound();

        const { subject } = await this.subjectsService.findSubjectForStudent(
            actor.id,
            subjectId,
        );
        const officialTest = await this.testModel
            .findOne({
                _id: testId,
                subjectId: new Types.ObjectId(subject._id),
                status: "PUBLISHED",
            })
            .lean();

        if (!officialTest) throw this.testNotFound();
        if (input.selectedOptionIndexes.length !== officialTest.questions.length) {
            throw new BadRequestException({
                code: "OFFICIAL_TEST_ANSWER_COUNT_MISMATCH",
                message: "Tens de responder a todas as perguntas do mini-teste.",
            });
        }

        const score = scoreOfficialTestAttempt(
            officialTest.questions,
            input.selectedOptionIndexes,
        );
        const answeredAt = new Date();
        const attempt = await this.attemptModel.create({
            testId: new Types.ObjectId(String(officialTest._id)),
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(subject.classId),
            studentId: new Types.ObjectId(actor.id),
            selectedOptionIndexes: input.selectedOptionIndexes,
            correctAnswers: score.correctAnswers,
            totalQuestions: score.totalQuestions,
            percentage: score.percentage,
            results: score.results,
            answeredAt,
        });

        return this.toAttemptView(attempt.toObject());
    }

    /**
     * Executa a operação count published by disciplina ids no domínio de testes oficiais com contrato explícito.
     *
     * @param subjectIds Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Número calculado para o chamador usar em contadores, limites ou ordenação.
     */
    async countPublishedBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.testModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status: "PUBLISHED",
        });
    }

    /**
     * Normaliza dados de testes oficiais para que validações e comparações usem sempre o mesmo formato.
     *
     * @param question Pergunta do aluno; é aparada e usada para construir contexto pedagógico controlado.
     * @returns Valor normalizado e seguro para ser usado pelo restante fluxo.
     */
    private normalizeQuestion(question: OfficialTestQuestion): OfficialTestQuestion {
        const options = question.options.map((option) => option.trim());
        if (new Set(options).size !== options.length || options.some((option) => !option)) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_TEST_OPTIONS",
                message: "Cada pergunta deve ter quatro opções distintas e preenchidas.",
            });
        }
        return {
            statement: question.statement.trim(),
            topic: question.topic?.trim(),
            options,
            correctOptionIndex: question.correctOptionIndex,
        };
    }

    /**
     * Valida uma pre-condicao de autorizacao ou domínio antes de continuar o fluxo.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertTeacher(actor: AuthenticatedUser): void {
        if (actor.role !== "TEACHER") {
            throw new ForbiddenException({
                code: "TEACHER_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de professores.",
            });
        }
    }

    /**
     * Valida que o fluxo é usado por um aluno real autenticado.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    private assertStudent(actor: AuthenticatedUser): void {
        if (actor.role !== "STUDENT") {
            throw new ForbiddenException({
                code: "STUDENT_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de alunos.",
            });
        }
    }

    /**
     * Constrói erro público para teste inexistente, rascunho ou fora do âmbito do aluno.
     *
     * @returns Exceção padronizada sem revelar testes em rascunho.
     */
    private testNotFound(): NotFoundException {
        return new NotFoundException({
            code: "OFFICIAL_TEST_NOT_FOUND",
            message: "Mini-teste oficial não encontrado.",
        });
    }

    /**
     * Mapeia o documento interno de testes oficiais para uma forma pública estável e simples de consumir.
     *
     * @param test Valor de test usado pela função para executar to view com dados explícitos.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
     */
    private toView(test: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        teacherId: unknown;
        title: string;
        description?: string;
        status: OfficialTestStatus;
        questions: OfficialTestQuestion[];
        createdAt?: Date;
    }): OfficialTestView {
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            classId: String(test.classId),
            teacherId: String(test.teacherId),
            title: test.title,
            description: test.description,
            status: test.status,
            questions: test.questions,
            createdAt: test.createdAt,
        };
    }

    /**
     * Mapeia um teste publicado para a vista segura de aluno.
     *
     * @param test Documento interno de teste oficial.
     * @returns Contrato público sem respostas corretas.
     */
    private toStudentView(test: {
        _id: unknown;
        subjectId: unknown;
        title: string;
        description?: string;
        status: OfficialTestStatus;
        questions: OfficialTestQuestion[];
        createdAt?: Date;
    }): OfficialTestStudentView {
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            title: test.title,
            description: test.description,
            status: "PUBLISHED",
            questions: test.questions.map((question) => ({
                statement: question.statement,
                topic: question.topic,
                options: question.options,
            })),
            createdAt: test.createdAt,
        };
    }

    /**
     * Mapeia a tentativa persistida para o contrato consumido pela UI e pelo ranking futuro.
     *
     * @param attempt Documento interno de tentativa oficial.
     * @returns Tentativa pública do aluno autenticado.
     */
    private toAttemptView(attempt: {
        _id: unknown;
        testId: unknown;
        subjectId: unknown;
        classId: unknown;
        studentId: unknown;
        selectedOptionIndexes: number[];
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        results: OfficialTestAttemptQuestionResult[];
        answeredAt: Date;
    }): OfficialTestAttemptView {
        return {
            _id: String(attempt._id),
            testId: String(attempt.testId),
            subjectId: String(attempt.subjectId),
            classId: String(attempt.classId),
            studentId: String(attempt.studentId),
            selectedOptionIndexes: attempt.selectedOptionIndexes,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage,
            results: attempt.results,
            answeredAt: attempt.answeredAt,
        };
    }
}
