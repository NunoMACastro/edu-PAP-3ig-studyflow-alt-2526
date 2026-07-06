// apps/api/src/modules/official-tests/official-tests.service.ts
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

export type OfficialTestStudentQuestionView = {
    statement: string;
    topic?: string;
    options: string[];
};

export type OfficialTestStudentView = {
    _id: string;
    subjectId: string;
    classId: string;
    title: string;
    description?: string;
    questions: OfficialTestStudentQuestionView[];
    createdAt?: Date;
};

export type OfficialTestAttemptView = {
    _id: string;
    testId: string;
    subjectId: string;
    classId: string;
    studentId: string;
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
     * @param testModel Modelo dos testes oficiais criados por professores.
     * @param attemptModel Modelo das tentativas submetidas por alunos.
     * @param subjectsService Service de disciplinas usado para validar ownership e inscrição.
     */
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly testModel: Model<OfficialTestDocument>,
        @InjectModel(OfficialTestAttempt.name)
        private readonly attemptModel: Model<OfficialTestAttemptDocument>,
        private readonly subjectsService: SubjectsService,
    ) {}

    /**
     * Cria um teste oficial depois de validar ownership docente.
     *
     * @param actor Professor autenticado.
     * @param subjectId Disciplina do professor.
     * @param input Payload validado pelo DTO docente.
     * @returns Teste oficial criado.
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
        return this.toTeacherView(test.toObject());
    }

    /**
     * Lista testes oficiais para o professor dono da disciplina.
     *
     * @param actor Professor autenticado.
     * @param subjectId Disciplina do professor.
     * @returns Testes oficiais da disciplina.
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
        return tests.map((test) => this.toTeacherView(test));
    }

    /**
     * Lista testes publicados para um aluno inscrito na disciplina.
     *
     * @param actor Aluno autenticado pela sessão.
     * @param subjectId Disciplina pedida.
     * @returns Testes publicados sem expor respostas corretas.
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

        // A vista do aluno remove `correctOptionIndex` para não revelar a prova antes da submissão.
        return tests.map((test) => this.toStudentView(test));
    }

    /**
     * Submete uma tentativa oficial e calcula pontuação no backend.
     *
     * @param actor Aluno autenticado pela sessão.
     * @param subjectId Disciplina da tentativa.
     * @param testId Teste publicado escolhido pelo aluno.
     * @param input Respostas escolhidas pelo aluno.
     * @returns Tentativa persistida com correção da própria submissão.
     */
    async submitStudentAttempt(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
        input: SubmitOfficialTestAttemptDto,
    ): Promise<OfficialTestAttemptView> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(testId)) throw this.officialTestNotFound();

        const { subject, schoolClass } =
            await this.subjectsService.findSubjectForStudent(actor.id, subjectId);
        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                subjectId: new Types.ObjectId(subject._id),
                status: "PUBLISHED",
            })
            .lean();

        if (!test) throw this.officialTestNotFound();

        this.validateAttemptAnswers(input.selectedOptionIndexes, test.questions);
        const score = scoreOfficialTestAttempt(
            test.questions,
            input.selectedOptionIndexes,
        );
        const results = this.buildQuestionResults(
            test.questions,
            input.selectedOptionIndexes,
        );

        const attempt = await this.attemptModel.create({
            testId: new Types.ObjectId(test._id),
            subjectId: new Types.ObjectId(subject._id),
            classId: new Types.ObjectId(schoolClass._id),
            // O studentId vem sempre da sessão, nunca do body enviado pelo frontend.
            studentId: new Types.ObjectId(actor.id),
            selectedOptionIndexes: input.selectedOptionIndexes,
            correctAnswers: score.correctAnswers,
            totalQuestions: score.totalQuestions,
            percentage: score.percentage,
            results,
            answeredAt: new Date(),
        });

        return this.toAttemptView(attempt.toObject());
    }

    /**
     * Conta testes publicados por disciplina para painéis de progresso.
     *
     * @param subjectIds Disciplinas a contabilizar.
     * @returns Número de testes publicados.
     */
    async countPublishedBySubjectIds(subjectIds: string[]): Promise<number> {
        if (subjectIds.length === 0) return 0;
        return this.testModel.countDocuments({
            subjectId: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
            status: "PUBLISHED",
        });
    }

    /**
     * Normaliza uma pergunta oficial antes de persistir.
     *
     * @param question Pergunta recebida do DTO docente.
     * @returns Pergunta normalizada.
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
     * Garante que cada resposta aponta para uma opção existente.
     *
     * @param selectedOptionIndexes Respostas submetidas pelo aluno.
     * @param questions Perguntas oficiais publicadas.
     * @throws BadRequestException quando falta uma resposta ou o índice não existe.
     */
    private validateAttemptAnswers(
        selectedOptionIndexes: number[],
        questions: OfficialTestQuestion[],
    ): void {
        if (selectedOptionIndexes.length !== questions.length) {
            throw new BadRequestException({
                code: "OFFICIAL_TEST_ATTEMPT_INCOMPLETE",
                message: "Responde a todas as perguntas antes de submeter o mini-teste.",
            });
        }

        const invalidIndex = selectedOptionIndexes.findIndex(
            (selectedOptionIndex, questionIndex) =>
                selectedOptionIndex < 0 ||
                selectedOptionIndex >= questions[questionIndex].options.length,
        );
        if (invalidIndex >= 0) {
            throw new BadRequestException({
                code: "INVALID_OFFICIAL_TEST_ANSWER",
                message: "Uma das respostas não corresponde a nenhuma opção do mini-teste.",
            });
        }
    }

    /**
     * Constrói a correção pergunta a pergunta da tentativa.
     *
     * @param questions Perguntas oficiais publicadas.
     * @param selectedOptionIndexes Respostas do aluno.
     * @returns Resultados individuais da tentativa.
     */
    private buildQuestionResults(
        questions: OfficialTestQuestion[],
        selectedOptionIndexes: number[],
    ): OfficialTestAttemptQuestionResult[] {
        return questions.map((question, questionIndex) => {
            const selectedOptionIndex = selectedOptionIndexes[questionIndex];
            return {
                questionIndex,
                selectedOptionIndex,
                correctOptionIndex: question.correctOptionIndex,
                isCorrect: selectedOptionIndex === question.correctOptionIndex,
            };
        });
    }

    /**
     * Confirma que o utilizador autenticado é professor.
     *
     * @param actor Utilizador autenticado.
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
     * Confirma que o utilizador autenticado é aluno.
     *
     * @param actor Utilizador autenticado.
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
     * Cria erro estável para testes oficiais não disponíveis ao aluno.
     *
     * @returns Exceção HTTP 404.
     */
    private officialTestNotFound(): NotFoundException {
        return new NotFoundException({
            code: "OFFICIAL_TEST_NOT_FOUND",
            message: "Mini-teste oficial não encontrado ou ainda não publicado.",
        });
    }

    /**
     * Converte documento interno para vista docente.
     *
     * @param test Documento ou objeto lean de teste oficial.
     * @returns Vista docente com respostas corretas.
     */
    private toTeacherView(test: {
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
     * Converte documento interno para vista segura do aluno.
     *
     * @param test Documento ou objeto lean de teste oficial.
     * @returns Vista sem respostas corretas.
     */
    private toStudentView(test: {
        _id: unknown;
        subjectId: unknown;
        classId: unknown;
        title: string;
        description?: string;
        questions: OfficialTestQuestion[];
        createdAt?: Date;
    }): OfficialTestStudentView {
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            classId: String(test.classId),
            title: test.title,
            description: test.description,
            questions: test.questions.map((question) => ({
                statement: question.statement,
                topic: question.topic,
                options: question.options,
            })),
            createdAt: test.createdAt,
        };
    }

    /**
     * Converte tentativa persistida para resposta pública da própria submissão.
     *
     * @param attempt Documento ou objeto de tentativa.
     * @returns Vista pública da tentativa.
     */
    private toAttemptView(attempt: {
        _id: unknown;
        testId: unknown;
        subjectId: unknown;
        classId: unknown;
        studentId: unknown;
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
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage,
            results: attempt.results,
            answeredAt: attempt.answeredAt,
        };
    }
}