/**
 * Implementa as regras de negócio de testes oficiais e concentra validações do domínio.
 */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Optional,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Types } from "mongoose";
import type { ClientSession, Connection, Model } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { ClassLearningActivityService } from "../class-learning-activity/class-learning-activity.service.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import { ContextNotificationsService } from "../context-notifications/context-notifications.service.js";
import { CreateOfficialTestDto } from "./dto/create-official-test.dto.js";
import { ChangeOfficialTestStatusDto } from "./dto/change-official-test-status.dto.js";
import { SubmitOfficialTestAttemptDto } from "./dto/submit-official-test-attempt.dto.js";
import { scoreOfficialTestAttempt } from "./official-test-attempt-scoring.js";
import {
    GuidedStudyRoom,
    GuidedStudyRoomDocument,
} from "../guided-study-rooms/schemas/guided-study-room.schema.js";
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
    status: "PUBLISHED" | "CLOSED";
    questions: OfficialTestStudentQuestionView[];
    attemptsUsed: number;
    attemptsRemaining: number;
    maxAttempts: typeof MAX_OFFICIAL_TEST_ATTEMPTS;
    canSubmit: boolean;
    blockedReason: "TEST_CLOSED" | "ATTEMPT_LIMIT_REACHED" | null;
    latestAttempt?: OfficialTestAttemptView | null;
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
    attemptNumber: number;
    attemptsRemaining: number;
    selectedOptionIndexes: number[];
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    solutionUnlocked: boolean;
    results: Array<
        Pick<
            OfficialTestAttemptQuestionResult,
            "questionIndex" | "selectedOptionIndex"
        > &
            Partial<
                Pick<
                    OfficialTestAttemptQuestionResult,
                    "correctOptionIndex" | "isCorrect"
                >
            >
    >;
    answeredAt: Date;
};

/**
 * Limite pedagógico e operacional comum à API e às vistas devolvidas ao aluno.
 */
export const MAX_OFFICIAL_TEST_ATTEMPTS = 3 as const;

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
     * @param connection Ligação MongoDB usada para serializar submissões e fecho do teste.
     */
    constructor(
        @InjectModel(OfficialTest.name)
        private readonly testModel: Model<OfficialTestDocument>,
        @InjectModel(OfficialTestAttempt.name)
        private readonly attemptModel: Model<OfficialTestAttemptDocument>,
        @InjectModel(GuidedStudyRoom.name)
        private readonly guidedRoomModel: Model<GuidedStudyRoomDocument>,
        private readonly subjectsService: SubjectsService,
        private readonly notificationsService: ContextNotificationsService,
        @InjectConnection() private readonly connection: Connection,
        @Optional()
        private readonly classLearningActivityService?: ClassLearningActivityService,
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
        const test = await this.connection.transaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                subject.classId,
                subject._id,
                session,
            );
            const [created] = await this.testModel.create([{
                subjectId: new Types.ObjectId(subject._id),
                classId: new Types.ObjectId(subject.classId),
                teacherId: new Types.ObjectId(actor.id),
                title: input.title.trim(),
                description: input.description?.trim(),
                // A publicação é sempre uma transição explícita e auditável posterior.
                status: "DRAFT",
                questions,
            }], { session });
            return created;
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
        const subject = await this.subjectsService.findOwnedSubjectForHistory(
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
     * Substitui o conteúdo editável de um teste apenas enquanto permanece DRAFT.
     * O estado integra o filtro atómico para impedir uma edição concorrente com
     * publicação ou encerramento.
     */
    async updateDraft(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
        input: CreateOfficialTestDto,
    ): Promise<OfficialTestView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        if (!Types.ObjectId.isValid(testId)) throw this.testNotFound();
        const questions = input.questions.map((question) =>
            this.normalizeQuestion(question),
        );
        return this.connection.transaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                subject.classId,
                subject._id,
                session,
            );
            const updated = await this.testModel
                .findOneAndUpdate(
                    {
                        _id: new Types.ObjectId(testId),
                        subjectId: new Types.ObjectId(subject._id),
                        teacherId: new Types.ObjectId(actor.id),
                        status: "DRAFT",
                    },
                    {
                        $set: {
                            title: input.title.trim(),
                            description: input.description?.trim(),
                            questions,
                        },
                    },
                    { new: true, runValidators: true, session },
                )
                .lean();
            if (updated) return this.toView(updated);

            const current = await this.testModel
                .findOne(
                    {
                        _id: new Types.ObjectId(testId),
                        subjectId: new Types.ObjectId(subject._id),
                        teacherId: new Types.ObjectId(actor.id),
                    },
                    null,
                    { session },
                )
                .lean();
            if (!current) throw this.testNotFound();
            throw new ConflictException({
                code: "OFFICIAL_TEST_NOT_EDITABLE",
                message: "Apenas testes em rascunho podem ser editados.",
            });
        });
    }

    /**
     * Lista testes publicados ou encerrados para o aluno inscrito, ocultando respostas corretas.
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
        const { subject } = await this.subjectsService.findSubjectForStudentHistory(
            actor.id,
            subjectId,
        );
        const tests = await this.testModel
            .find({
                subjectId: new Types.ObjectId(subject._id),
                status: { $in: ["PUBLISHED", "CLOSED"] },
            })
            .sort({ createdAt: -1 })
            .lean();
        if (!tests.length) return [];
        const attemptRows = await this.attemptModel.aggregate<{
            _id: Types.ObjectId;
            attemptsUsed: number;
            latestAttempt: {
                _id: unknown;
                testId: unknown;
                subjectId: unknown;
                classId: unknown;
                studentId: unknown;
                attemptNumber: number;
                selectedOptionIndexes: number[];
                correctAnswers: number;
                totalQuestions: number;
                percentage: number;
                results: OfficialTestAttemptQuestionResult[];
                answeredAt: Date;
            };
        }>([
            {
                $match: {
                    testId: {
                        $in: tests.map((test) => new Types.ObjectId(String(test._id))),
                    },
                    studentId: new Types.ObjectId(actor.id),
                },
            },
            { $sort: { answeredAt: -1, _id: -1 } },
            {
                $group: {
                    _id: "$testId",
                    attemptsUsed: { $sum: 1 },
                    latestAttempt: { $first: "$$ROOT" },
                },
            },
        ]);
        const attemptSummaryByTest = new Map(
            attemptRows.map((row) => [String(row._id), row]),
        );
        return tests.map((test) => {
            const summary = attemptSummaryByTest.get(String(test._id));
            return this.toStudentView(
                test,
                summary?.attemptsUsed ?? 0,
                summary?.latestAttempt,
            );
        });
    }

    /**
     * Avança um teste exatamente um passo no ciclo DRAFT -> PUBLISHED -> CLOSED.
     *
     * O filtro pelo estado esperado faz da alteração uma comparação-e-troca: duas
     * ações concorrentes não conseguem saltar estados nem reabrir um teste.
     *
     * @param actor Professor autenticado e dono da disciplina.
     * @param subjectId Disciplina oficial validada pelo backend.
     * @param testId Teste a publicar ou encerrar.
     * @param input Único estado de destino pedido pelo cliente.
     * @returns Teste no novo estado, ou o estado já alcançado num retry idempotente.
     */
    async changeStatus(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
        input: ChangeOfficialTestStatusDto,
    ): Promise<OfficialTestView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        if (!Types.ObjectId.isValid(testId)) throw this.testNotFound();

        const expectedStatus: OfficialTestStatus =
            input.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        return this.connection.transaction(async (session) => {
            await this.subjectsService.reserveActiveChildMutation(
                actor.id,
                subject.classId,
                subject._id,
                session,
            );
            if (input.status === "CLOSED") {
                const roomQuery = this.guidedRoomModel.exists({
                    officialTestId: new Types.ObjectId(testId),
                    status: "OPEN",
                });
                const requiredByOpenRoom =
                    typeof (roomQuery as { session?: unknown }).session === "function"
                        ? await roomQuery.session(session)
                        : await roomQuery;
                if (requiredByOpenRoom) {
                    throw new ConflictException({
                        code: "OFFICIAL_TEST_REQUIRED_BY_OPEN_GUIDED_ROOM",
                        message:
                            "Encerra primeiro as salas guiadas abertas que exigem este mini-teste.",
                    });
                }
            }
            const changed = await this.testModel
                .findOneAndUpdate(
                    {
                        _id: new Types.ObjectId(testId),
                        subjectId: new Types.ObjectId(subject._id),
                        teacherId: new Types.ObjectId(actor.id),
                        status: expectedStatus,
                    },
                    input.status === "CLOSED"
                        ? {
                              $set: {
                                  status: "CLOSED",
                                  closedAt: new Date(),
                                  closedReason: "TEACHER",
                              },
                          }
                        : { $set: { status: input.status } },
                    { new: true, session },
                )
                .lean();

            if (changed) {
                const view = this.toView(changed);
                await this.notifyStatusChanged(actor, view, session);
                return view;
            }

            const current = await this.testModel
                .findOne(
                    {
                        _id: new Types.ObjectId(testId),
                        subjectId: new Types.ObjectId(subject._id),
                        teacherId: new Types.ObjectId(actor.id),
                    },
                    null,
                    { session },
                )
                .lean();
            if (!current) throw this.testNotFound();

            // Repetir exatamente a mesma transição é seguro depois de timeout/retry.
            if (current.status === input.status) {
                const view = this.toView(current);
                await this.notifyStatusChanged(actor, view, session);
                return view;
            }

            throw new ConflictException({
                code: "OFFICIAL_TEST_INVALID_STATUS_TRANSITION",
                message:
                    "A transição pedida não respeita o ciclo rascunho, publicado e encerrado.",
            });
        });
    }

    /** Enfileira uma única notificação por transição oficial. */
    private async notifyStatusChanged(
        actor: AuthenticatedUser,
        test: OfficialTestView,
        session?: ClientSession,
    ): Promise<void> {
        if (test.status === "DRAFT") return;
        await this.notificationsService.enqueueClassEvent(actor, {
            classId: test.classId,
            idempotencyKey: `official-test:${test._id}:${test.status.toLowerCase()}`,
            type:
                test.status === "PUBLISHED"
                    ? "OFFICIAL_TEST_PUBLISHED"
                    : "OFFICIAL_TEST_CLOSED",
            title:
                test.status === "PUBLISHED"
                    ? `Mini-teste disponível: ${test.title}`
                    : `Mini-teste encerrado: ${test.title}`,
            body:
                test.status === "PUBLISHED"
                    ? "Está disponível um novo mini-teste oficial."
                    : "O mini-teste foi encerrado e as soluções disponíveis podem ser consultadas.",
            targetPath: `/app/disciplinas/${test.subjectId}/testes`,
        }, session);
    }

    /**
     * Escreve o fence do teste dentro da transação que cria ou reabre uma sala.
     * Esta escrita serializa a dependência com o fecho do teste.
     */
    async reserveGuidedRoomDependency(
        teacherId: string,
        classId: string,
        testId: string,
        session: ClientSession,
    ): Promise<void> {
        if (!Types.ObjectId.isValid(testId)) throw this.testNotFound();
        const fence = await this.testModel.updateOne(
            {
                _id: new Types.ObjectId(testId),
                classId: new Types.ObjectId(classId),
                teacherId: new Types.ObjectId(teacherId),
                status: "PUBLISHED",
            },
            { $inc: { submissionFenceVersion: 1 } },
            { session },
        );
        if (fence.matchedCount !== 1) {
            throw new ConflictException({
                code: "GUIDED_ROOM_OFFICIAL_TEST_NOT_PUBLISHED",
                message: "O mini-teste associado já não está publicado.",
            });
        }
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
        const subjectObjectId = new Types.ObjectId(subject._id);
        const testObjectId = new Types.ObjectId(testId);
        const studentObjectId = new Types.ObjectId(actor.id);

        try {
            const attempt = await this.connection.transaction((session) =>
                this.submitAttemptInTransaction(
                    subjectObjectId,
                    new Types.ObjectId(subject.classId),
                    testObjectId,
                    studentObjectId,
                    input,
                    session,
                ),
            );
            await this.recordAttemptActivity(attempt);
            return attempt;
        } catch (error) {
            if (!isMongoDuplicateKeyError(error)) throw error;

            // Defesa adicional para um retry que colida com o índice único no
            // instante do commit. A leitura fresca mantém a mesma semântica da
            // transação sem converter colisões alheias em sucessos falsos.
            const currentTest = await this.testModel
                .findOne({
                    _id: testObjectId,
                    subjectId: subjectObjectId,
                    status: { $in: ["PUBLISHED", "CLOSED"] },
                })
                .lean();
            const retry = await this.attemptModel
                .findOne({
                    testId: testObjectId,
                    studentId: studentObjectId,
                    attemptKey: input.attemptKey,
                })
                .lean();
            if (!currentTest || !retry) throw error;
            const attemptsUsed = await this.attemptModel.countDocuments({
                testId: testObjectId,
                studentId: studentObjectId,
            });
            const attempt = this.toAttemptView(
                retry,
                this.isSolutionUnlocked(currentTest.status, attemptsUsed),
            );
            await this.recordAttemptActivity(attempt);
            return attempt;
        }
    }

    /** Regista a tentativa como atividade da turma sem invalidar a submissão. */
    private async recordAttemptActivity(
        attempt: OfficialTestAttemptView,
    ): Promise<void> {
        await this.classLearningActivityService?.recordBestEffort({
            classId: attempt.classId,
            studentId: attempt.studentId,
            subjectId: attempt.subjectId,
            type: "OFFICIAL_TEST_ATTEMPT",
            sourceEventKey: `official-test-attempt:${attempt._id}`,
            occurredAt: attempt.answeredAt,
        });
    }

    /**
     * Executa uma submissão na mesma transação que escreve o fence do teste.
     *
     * A escrita no documento do teste serializa a criação da tentativa com a
     * transição para CLOSED. Assim, ou a tentativa confirma integralmente antes
     * do fecho, ou a repetição transacional observa CLOSED e recusa uma tentativa
     * nova. Retries já persistidos continuam consultáveis depois do fecho.
     */
    private async submitAttemptInTransaction(
        subjectObjectId: Types.ObjectId,
        classObjectId: Types.ObjectId,
        testObjectId: Types.ObjectId,
        studentObjectId: Types.ObjectId,
        input: SubmitOfficialTestAttemptDto,
        session: ClientSession,
    ): Promise<OfficialTestAttemptView> {
        const officialTest = await this.testModel
            .findOne(
                {
                    _id: testObjectId,
                    subjectId: subjectObjectId,
                    status: { $in: ["PUBLISHED", "CLOSED"] },
                },
                null,
                { session },
            )
            .lean();
        if (!officialTest) throw this.testNotFound();

        const identity = {
            testId: testObjectId,
            studentId: studentObjectId,
        };
        const existingRetry = await this.attemptModel
            .findOne(
                { ...identity, attemptKey: input.attemptKey },
                null,
                { session },
            )
            .lean();
        if (existingRetry) {
            const attemptsUsed = await this.attemptModel.countDocuments(identity, {
                session,
            });
            return this.toAttemptView(
                existingRetry,
                this.isSolutionUnlocked(officialTest.status, attemptsUsed),
            );
        }

        // CLOSED impede apenas tentativas novas. A verificação vem depois da
        // chave idempotente para permitir recuperar a resposta de um commit que
        // o cliente não chegou a receber antes do professor encerrar o teste.
        if (officialTest.status !== "PUBLISHED") throw this.testNotFound();
        if (input.selectedOptionIndexes.length !== officialTest.questions.length) {
            throw new BadRequestException({
                code: "OFFICIAL_TEST_ANSWER_COUNT_MISMATCH",
                message: "Tens de responder a todas as perguntas do mini-teste.",
            });
        }

        // O fence é o ponto de serialização comum a todas as submissões e ao
        // fecho: o update de CLOSED escreve o mesmo documento e provoca retry
        // transacional sobre um snapshot atual quando existe uma corrida.
        const fence = await this.testModel.updateOne(
            { _id: testObjectId, subjectId: subjectObjectId, status: "PUBLISHED" },
            { $inc: { submissionFenceVersion: 1 } },
            { session },
        );
        if (fence.matchedCount !== 1) throw this.testNotFound();

        const attemptsUsed = await this.attemptModel.countDocuments(identity, {
            session,
        });
        if (attemptsUsed >= MAX_OFFICIAL_TEST_ATTEMPTS) {
            throw this.attemptLimitReached();
        }

        const score = scoreOfficialTestAttempt(
            officialTest.questions,
            input.selectedOptionIndexes,
        );
        const attemptNumber = attemptsUsed + 1;
        const [attempt] = await this.attemptModel.create(
            [
                {
                    testId: testObjectId,
                    subjectId: subjectObjectId,
                    classId: classObjectId,
                    studentId: studentObjectId,
                    attemptNumber,
                    attemptKey: input.attemptKey,
                    selectedOptionIndexes: input.selectedOptionIndexes,
                    correctAnswers: score.correctAnswers,
                    totalQuestions: score.totalQuestions,
                    percentage: score.percentage,
                    results: score.results,
                    answeredAt: new Date(),
                },
            ],
            { session },
        );

        return this.toAttemptView(
            attempt.toObject(),
            this.isSolutionUnlocked(officialTest.status, attemptsUsed + 1),
        );
    }

    /**
     * Lista as tentativas do aluno autenticado e só desbloqueia soluções quando
     * o teste está encerrado ou quando as três tentativas já foram consumidas.
     *
     * @param actor Aluno autenticado pela sessão.
     * @param subjectId Disciplina cuja inscrição é revalidada.
     * @param testId Mini-teste oficial publicado ou encerrado.
     * @returns Tentativas cronológicas com feedback minimizado ou solução completa.
     */
    async listMyAttempts(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
    ): Promise<OfficialTestAttemptView[]> {
        this.assertStudent(actor);
        if (!Types.ObjectId.isValid(testId)) throw this.testNotFound();

        const { subject } = await this.subjectsService.findSubjectForStudentHistory(
            actor.id,
            subjectId,
        );
        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                subjectId: new Types.ObjectId(subject._id),
                status: { $in: ["PUBLISHED", "CLOSED"] },
            })
            .lean();
        if (!test) throw this.testNotFound();

        const attempts = await this.attemptModel
            .find({
                testId: new Types.ObjectId(testId),
                studentId: new Types.ObjectId(actor.id),
            })
            .sort({ attemptNumber: 1, answeredAt: 1 })
            .lean();
        const solutionUnlocked = this.isSolutionUnlocked(
            test.status,
            attempts.length,
        );
        return attempts.map((attempt) =>
            this.toAttemptView(attempt, solutionUnlocked, test.status === "PUBLISHED"),
        );
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
     * Conta mini-testes publicados por disciplina já autorizada pelo chamador.
     *
     * @param subjectIds Disciplinas oficiais autorizadas pelo chamador.
     * @returns Mapa subjectId -> número de mini-testes publicados.
     */
    async countPublishedBySubjectIdsGrouped(
        subjectIds: string[],
    ): Promise<Record<string, number>> {
        if (subjectIds.length === 0) return {};
        const rows = await this.testModel.aggregate<{
            _id: Types.ObjectId;
            count: number;
        }>([
            {
                $match: {
                    subjectId: {
                        $in: subjectIds.map((id) => new Types.ObjectId(id)),
                    },
                    status: "PUBLISHED",
                },
            },
            { $group: { _id: "$subjectId", count: { $sum: 1 } } },
        ]);
        return rows.reduce<Record<string, number>>((counts, row) => {
            counts[String(row._id)] = row.count;
            return counts;
        }, {});
    }

    /**
     * Obtém um mini-teste publicado pertencente ao professor para associação segura.
     *
     * @param teacherId Professor proprietário.
     * @param testId Mini-teste a associar.
     * @returns Mini-teste publicado no contrato público.
     */
    async findOwnedPublishedTest(
        teacherId: string,
        testId: string,
    ): Promise<OfficialTestView> {
        if (!Types.ObjectId.isValid(testId)) throw this.testNotFound();
        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                teacherId: new Types.ObjectId(teacherId),
                status: "PUBLISHED",
            })
            .lean();
        if (!test) throw this.testNotFound();
        return this.toView(test);
    }

    /**
     * Obtém um mini-teste pertencente ao professor, independentemente do estado.
     * Destina-se a apresentar associações já validadas sem tornar rascunhos
     * associáveis a novas salas.
     */
    async findOwnedTest(
        teacherId: string,
        testId: string,
    ): Promise<OfficialTestView> {
        if (!Types.ObjectId.isValid(testId)) throw this.testNotFound();
        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                teacherId: new Types.ObjectId(teacherId),
            })
            .lean();
        if (!test) throw this.testNotFound();
        return this.toView(test);
    }

    /**
     * Confirma se o aluno submeteu pelo menos uma tentativa do mini-teste.
     *
     * @param testId Mini-teste associado à sala.
     * @param studentId Aluno autenticado.
     * @returns Verdadeiro quando existe uma tentativa persistida.
     */
    async hasStudentAttempt(testId: string, studentId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(testId) || !Types.ObjectId.isValid(studentId)) {
            return false;
        }
        return Boolean(
            await this.attemptModel.exists({
                testId: new Types.ObjectId(testId),
                studentId: new Types.ObjectId(studentId),
            }),
        );
    }

    /**
     * Normaliza dados de testes oficiais para que validações e comparações usem sempre o mesmo formato.
     *
     * @param question Pergunta do aluno; é aparada e usada para construir contexto pedagógico controlado.
     * @returns Valor normalizado e seguro para ser usado pelo restante fluxo.
     */
    private normalizeQuestion(question: OfficialTestQuestion): OfficialTestQuestion {
        const options = question.options.map((option) => option.trim());
        const comparisonOptions = options.map((option) =>
            option.toLocaleLowerCase("pt-PT"),
        );
        if (
            new Set(comparisonOptions).size !== options.length ||
            options.some((option) => !option)
        ) {
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
     * Produz o conflito estável usado quando as três posições já estão ocupadas.
     *
     * @returns Exceção 409 que permite à UI distinguir o limite de um erro técnico.
     */
    private attemptLimitReached(): ConflictException {
        return new ConflictException({
            code: "OFFICIAL_TEST_ATTEMPT_LIMIT_REACHED",
            message: "Já utilizaste as três tentativas permitidas neste mini-teste.",
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
    }, attemptsUsed: number, latestAttempt?: {
        _id: unknown;
        testId: unknown;
        subjectId: unknown;
        classId: unknown;
        studentId: unknown;
        attemptNumber: number;
        selectedOptionIndexes: number[];
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        results: OfficialTestAttemptQuestionResult[];
        answeredAt: Date;
    }): OfficialTestStudentView {
        const safeAttemptsUsed = Math.min(
            Math.max(attemptsUsed, 0),
            MAX_OFFICIAL_TEST_ATTEMPTS,
        );
        const blockedReason: OfficialTestStudentView["blockedReason"] =
            test.status === "CLOSED"
                ? "TEST_CLOSED"
                : safeAttemptsUsed >= MAX_OFFICIAL_TEST_ATTEMPTS
                  ? "ATTEMPT_LIMIT_REACHED"
                  : null;
        return {
            _id: String(test._id),
            subjectId: String(test.subjectId),
            title: test.title,
            description: test.description,
            status: test.status === "CLOSED" ? "CLOSED" : "PUBLISHED",
            questions: test.questions.map((question) => ({
                statement: question.statement,
                topic: question.topic,
                options: question.options,
            })),
            attemptsUsed: safeAttemptsUsed,
            attemptsRemaining:
                test.status === "CLOSED"
                    ? 0
                    : MAX_OFFICIAL_TEST_ATTEMPTS - safeAttemptsUsed,
            maxAttempts: MAX_OFFICIAL_TEST_ATTEMPTS,
            canSubmit: blockedReason === null,
            blockedReason,
            latestAttempt: latestAttempt
                ? this.toAttemptView(
                      latestAttempt,
                      this.isSolutionUnlocked(test.status, safeAttemptsUsed),
                      test.status === "PUBLISHED",
                  )
                : null,
            createdAt: test.createdAt,
        };
    }

    /**
     * Mapeia a tentativa persistida para o contrato consumido pela UI e pelo ranking futuro.
     *
     * @param attempt Documento interno de tentativa oficial.
     * @param solutionUnlocked Indica se a política permite revelar a solução completa.
     * @returns Tentativa pública do aluno autenticado.
     */
    private toAttemptView(attempt: {
        _id: unknown;
        testId: unknown;
        subjectId: unknown;
        classId: unknown;
        studentId: unknown;
        attemptNumber: number;
        selectedOptionIndexes: number[];
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        results: OfficialTestAttemptQuestionResult[];
        answeredAt: Date;
    }, solutionUnlocked: boolean, attemptsAllowed = true): OfficialTestAttemptView {
        return {
            _id: String(attempt._id),
            testId: String(attempt.testId),
            subjectId: String(attempt.subjectId),
            classId: String(attempt.classId),
            studentId: String(attempt.studentId),
            attemptNumber: attempt.attemptNumber,
            attemptsRemaining: attemptsAllowed
                ? Math.max(0, MAX_OFFICIAL_TEST_ATTEMPTS - attempt.attemptNumber)
                : 0,
            selectedOptionIndexes: attempt.selectedOptionIndexes,
            correctAnswers: attempt.correctAnswers,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage,
            solutionUnlocked,
            results: attempt.results.map((result) =>
                solutionUnlocked
                    ? result
                    : {
                          questionIndex: result.questionIndex,
                          selectedOptionIndex: result.selectedOptionIndex,
                      },
            ),
            answeredAt: attempt.answeredAt,
        };
    }

    /**
     * Centraliza a política de revelação para respostas novas, retries e listas.
     *
     * @param status Estado atual do teste no mesmo snapshot da operação.
     * @param attemptsUsed Total atual de tentativas do aluno nesse teste.
     * @returns `true` depois do fecho ou quando as três tentativas foram usadas.
     */
    private isSolutionUnlocked(
        status: OfficialTestStatus,
        attemptsUsed: number,
    ): boolean {
        return (
            status === "CLOSED" ||
            attemptsUsed >= MAX_OFFICIAL_TEST_ATTEMPTS
        );
    }
}

/**
 * Reconhece apenas a colisão de índice único do MongoDB sem esconder outros
 * erros de persistência.
 *
 * @param error Valor lançado pelo driver ou por Mongoose.
 * @returns `true` apenas para o código oficial de duplicate key.
 */
function isMongoDuplicateKeyError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === 11000
    );
}
