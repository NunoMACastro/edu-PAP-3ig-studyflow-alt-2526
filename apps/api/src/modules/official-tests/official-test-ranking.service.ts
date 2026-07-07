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
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    answeredAt: Date;
};

/**
 * Vista agregada devolvida ao professor autorizado.
 */
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
            return (
                new Date(left.answeredAt).getTime() -
                new Date(right.answeredAt).getTime()
            );
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
                answeredAt: new Date(attempt.answeredAt),
            };
        });
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
        const subject = await this.subjectsService.findOwnedSubject(
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
            // A autorização fica acima; o helper recebe apenas tentativas já filtradas.
            rows: buildOfficialTestRanking(attempts),
        };
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
