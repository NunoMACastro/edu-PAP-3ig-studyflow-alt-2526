// apps/api/src/modules/official-tests/official-test-ranking.service.ts
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

export type OfficialTestRankingAttempt = {
    studentId: unknown;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: Date;
};

export type OfficialTestRankingRow = {
    position: number;
    studentRef: string;
    displayName: string;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: Date;
};

export type OfficialTestRankingView = {
    testId: string;
    subjectId: string;
    classId: string;
    rows: OfficialTestRankingRow[];
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
    return [...attempts]
        .sort((left, right) => {
            if (right.percentage !== left.percentage) {
                return right.percentage - left.percentage;
            }

            // Em empate, a tentativa mais antiga fica primeiro para a regra ser previsível.
            return left.answeredAt.getTime() - right.answeredAt.getTime();
        })
        .map((attempt, index) => {
            const studentRef = String(attempt.studentId);
            return {
                position: index + 1,
                studentRef,
                displayName: `Aluno ${studentRef.slice(-4)}`,
                correctAnswers: attempt.correctAnswers,
                totalQuestions: attempt.totalQuestions,
                percentage: attempt.percentage,
                answeredAt: attempt.answeredAt,
            };
        });
}

/**
 * Service de ranking dos mini-testes oficiais.
 */
@Injectable()
export class OfficialTestRankingService {
    /**
     * @param testModel Modelo de mini-testes oficiais.
     * @param attemptModel Modelo de tentativas oficiais criado no BK-MF8-12.
     * @param subjectsService Service que valida ownership docente da disciplina.
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
     * @throws ForbiddenException quando o utilizador não é professor.
     * @throws NotFoundException quando o teste não pertence à disciplina validada.
     */
    async listForTeacher(
        actor: AuthenticatedUser,
        subjectId: string,
        testId: string,
    ): Promise<OfficialTestRankingView> {
        this.assertTeacher(actor);
        if (!Types.ObjectId.isValid(testId)) throw this.officialTestNotFound();

        const subject = await this.subjectsService.findOwnedSubject(
            actor.id,
            subjectId,
        );
        const test = await this.testModel
            .findOne({
                _id: new Types.ObjectId(testId),
                subjectId: new Types.ObjectId(subject._id),
            })
            .lean();

        if (!test) throw this.officialTestNotFound();

        const attempts = await this.attemptModel
            .find({
                testId: new Types.ObjectId(test._id),
                subjectId: new Types.ObjectId(subject._id),
                classId: new Types.ObjectId(subject.classId),
            })
            .sort({ percentage: -1, answeredAt: 1 })
            .lean();

        return {
            testId: String(test._id),
            subjectId: String(subject._id),
            classId: String(subject.classId),
            // O helper recebe apenas tentativas já filtradas para não misturar autorização com ordenação.
            rows: buildOfficialTestRanking(attempts),
        };
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
     * Cria erro estável para mini-teste inacessível.
     *
     * @returns Exceção HTTP 404.
     */
    private officialTestNotFound(): NotFoundException {
        return new NotFoundException({
            code: "OFFICIAL_TEST_NOT_FOUND",
            message: "Mini-teste oficial não encontrado.",
        });
    }
}