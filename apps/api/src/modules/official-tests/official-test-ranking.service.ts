/**
 * Implementa o ranking docente de mini-testes oficiais com filtros de ownership.
 */
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { SubjectsService } from "../subjects/subjects.service.js";
import {
    OfficialTestAttempt,
    OfficialTestAttemptDocument,
} from "./schemas/official-test-attempt.schema.js";
import {
    OfficialTest,
    OfficialTestDocument,
} from "./schemas/official-test.schema.js";

/**
 * Tentativa já autorizada e filtrada, pronta para ordenação pedagógica.
 */
export type OfficialTestRankingAttempt = {
    _id?: string | Types.ObjectId;
    studentId: string | Types.ObjectId;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: Date | string;
};

/**
 * Linha pública do ranking docente sem respostas completas nem email do aluno.
 */
export type OfficialTestRankingRow = {
    position: number;
    studentRef: string;
    displayName: string;
    bestCorrectAnswers: number;
    bestTotalQuestions: number;
    bestPercentage: number;
    bestAnsweredAt: Date;
    attemptCount: number;
};

/**
 * Vista agregada devolvida ao professor autorizado.
 */
export type OfficialTestRankingView = {
    testId: string;
    subjectId: string;
    classId: string;
    policy: "BEST_ATTEMPT";
    rows: OfficialTestRankingRow[];
};

/**
 * Resumo factual de um mini-teste oficial no centro de acompanhamento.
 */
export type FollowUpOfficialTestView = {
    testId: string;
    subjectId: string;
    subjectName: string;
    title: string;
    status: "PUBLISHED" | "CLOSED";
    bestAttempt: null | {
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        attemptCount: number;
        answeredAt: string;
    };
};

/**
 * Ordena tentativas oficiais e transforma-as em linhas seguras de ranking.
 *
 * @param attempts Tentativas já filtradas por professor, disciplina, turma e teste.
 * @returns Linhas ordenadas sem respostas completas nem email do aluno.
 */
export function buildOfficialTestRanking(
    attempts: OfficialTestRankingAttempt[],
): OfficialTestRankingRow[] {
    const bestByStudent = new Map<
        string,
        { attempt: OfficialTestRankingAttempt; attemptCount: number }
    >();

    for (const attempt of attempts) {
        const studentRef = String(attempt.studentId);
        const current = bestByStudent.get(studentRef);
        if (!current) {
            bestByStudent.set(studentRef, { attempt, attemptCount: 1 });
            continue;
        }

        current.attemptCount += 1;
        if (compareAttempts(attempt, current.attempt) < 0) {
            current.attempt = attempt;
        }
    }

    return [...bestByStudent.values()]
        .sort((left, right) => compareRankingEntries(left, right))
        .map(({ attempt, attemptCount }, index) => {
            const studentRef = String(attempt.studentId);
            return {
                position: index + 1,
                studentRef,
                displayName: `Aluno ${studentRef.slice(-4)}`,
                bestCorrectAnswers: attempt.correctAnswers,
                bestTotalQuestions: attempt.totalQuestions,
                bestPercentage: attempt.percentage,
                bestAnsweredAt: new Date(attempt.answeredAt),
                attemptCount,
            };
        });
}

/**
 * Compara duas tentativas segundo a política BEST_ATTEMPT.
 *
 * A maior percentagem vence; em empate vence a submissão mais antiga e depois
 * o identificador persistido da tentativa, sem introduzir critérios ocultos.
 *
 * @param left Primeira tentativa a comparar.
 * @param right Segunda tentativa a comparar.
 * @returns Valor negativo quando `left` deve surgir antes de `right`.
 */
function compareAttempts(
    left: OfficialTestRankingAttempt,
    right: OfficialTestRankingAttempt,
): number {
    if (right.percentage !== left.percentage) {
        return right.percentage - left.percentage;
    }
    const dateComparison =
        new Date(left.answeredAt).getTime() -
        new Date(right.answeredAt).getTime();
    if (dateComparison !== 0) return dateComparison;
    return String(left._id ?? "").localeCompare(String(right._id ?? ""));
}

/**
 * Ordena as melhores tentativas de alunos diferentes e usa o aluno como chave
 * estável final quando percentagem e instante coincidem.
 */
function compareRankingEntries(
    left: { attempt: OfficialTestRankingAttempt },
    right: { attempt: OfficialTestRankingAttempt },
): number {
    const attemptComparison = compareAttempts(left.attempt, right.attempt);
    if (attemptComparison !== 0) return attemptComparison;
    return String(left.attempt.studentId).localeCompare(
        String(right.attempt.studentId),
    );
}

/**
 * Service de ranking dos mini-testes oficiais.
 */
@Injectable()
export class OfficialTestRankingService {
    /**
     * Recebe as dependências injetadas de OfficialTestRankingService para manter mini-testes oficiais testável e separado de detalhes externos.
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
     * Lista ranking de um mini-teste oficial para o professor dono da disciplina.
     *
     * @param actor Professor autenticado pela sessão.
     * @param subjectId Disciplina oficial do professor.
     * @param testId Mini-teste oficial a consultar.
     * @returns Ranking com dados mínimos das tentativas.
     * @throws ForbiddenException Quando o utilizador não é professor.
     * @throws NotFoundException Quando a disciplina ou o teste não existem no âmbito validado.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
    ): Promise<OfficialTestRankingView> {
        this.assertTeacher(actor);
        const subject = await this.subjectsService.findOwnedSubjectForHistory(
            actor.id,
            subjectId,
        );
        if (!Types.ObjectId.isValid(testId)) throw this.officialTestNotFound();

        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                subjectId: new Types.ObjectId(subject._id),
            })
            .lean();

        if (!test) throw this.officialTestNotFound();

        const attempts = await this.attemptModel
            .find({
                testId: new Types.ObjectId(String(test._id)),
                subjectId: new Types.ObjectId(subject._id),
                classId: new Types.ObjectId(subject.classId),
            })
            .sort({ percentage: -1, answeredAt: 1 })
            .lean();

        return {
            testId: String(test._id),
            subjectId: String(subject._id),
            classId: String(subject.classId),
            policy: "BEST_ATTEMPT",
            // A autorização fica acima; o helper recebe apenas tentativas já filtradas.
            rows: buildOfficialTestRanking(attempts),
        };
    }

    /**
     * Lista resultados oficiais de um aluno numa turma já validada pelo acompanhamento.
     * Mantém a política BEST_ATTEMPT e não devolve respostas nem soluções.
     *
     * @param actor Professor autenticado.
     * @param classId Turma pertencente ao professor.
     * @param studentId Aluno previamente confirmado como membro da turma.
     * @returns Mini-testes publicados ou encerrados com a melhor tentativa, quando existe.
     */
    async listStudentResultsForTeacher(
        actor: AuthenticatedUser,
        classId: string,
        studentId: string,
    ): Promise<FollowUpOfficialTestView[]> {
        this.assertTeacher(actor);
        const subjects = await this.subjectsService.listTeacherClassSubjects(
            actor,
            classId,
        );
        if (subjects.length === 0) return [];

        const subjectIds = subjects.map((subject) => new Types.ObjectId(subject._id));
        const tests = await this.testModel
            .find({
                classId: new Types.ObjectId(classId),
                teacherId: new Types.ObjectId(actor.id),
                subjectId: { $in: subjectIds },
                status: { $in: ["PUBLISHED", "CLOSED"] },
            })
            .sort({ createdAt: -1 })
            .lean();
        if (tests.length === 0) return [];

        const attempts = await this.attemptModel
            .find({
                classId: new Types.ObjectId(classId),
                studentId: new Types.ObjectId(studentId),
                testId: {
                    $in: tests.map((test) => new Types.ObjectId(String(test._id))),
                },
            })
            .sort({ percentage: -1, answeredAt: 1 })
            .lean();
        const attemptsByTest = new Map<string, OfficialTestRankingAttempt[]>();
        for (const attempt of attempts) {
            const targetTestId = String(attempt.testId);
            attemptsByTest.set(targetTestId, [
                ...(attemptsByTest.get(targetTestId) ?? []),
                attempt,
            ]);
        }
        const subjectsById = new Map(
            subjects.map((subject) => [subject._id, subject.name]),
        );

        return tests.map((test) => {
            const targetTestId = String(test._id);
            const best = buildOfficialTestRanking(
                attemptsByTest.get(targetTestId) ?? [],
            )[0];
            return {
                testId: targetTestId,
                subjectId: String(test.subjectId),
                subjectName:
                    subjectsById.get(String(test.subjectId)) ?? "Disciplina",
                title: test.title,
                status: test.status as "PUBLISHED" | "CLOSED",
                bestAttempt: best
                    ? {
                          correctAnswers: best.bestCorrectAnswers,
                          totalQuestions: best.bestTotalQuestions,
                          percentage: best.bestPercentage,
                          attemptCount: best.attemptCount,
                          answeredAt: best.bestAnsweredAt.toISOString(),
                      }
                    : null,
            };
        });
    }

    /**
     * Confirma que o utilizador autenticado é professor antes de qualquer leitura sensível.
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
     * Cria erro estável para mini-teste inacessível.
     *
     * @returns Exceção HTTP 404 sem revelar existência fora da disciplina autorizada.
     */
    private officialTestNotFound(): NotFoundException {
        return new NotFoundException({
            code: "OFFICIAL_TEST_NOT_FOUND",
            message: "Mini-teste oficial não encontrado.",
        });
    }
}
