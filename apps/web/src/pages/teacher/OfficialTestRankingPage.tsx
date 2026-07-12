/**
 * Apresenta o ranking docente dos mini-testes oficiais.
 */
import { useEffect, useState } from "react";
import {
    getOfficialTestRanking,
    type OfficialTestRanking,
} from "../../lib/apiClient.js";

/**
 * Props vindas da rota protegida de professor.
 */
type OfficialTestRankingPageProps = {
    subjectId: string;
    testId: string;
};

/**
 * Página docente de ranking de mini-testes oficiais.
 *
 * @param props Identificadores da disciplina e do teste vindos da URL.
 * @returns Tabela de ranking ou estados controlados.
 */
export function OfficialTestRankingPage({
    subjectId,
    testId,
}: OfficialTestRankingPageProps) {
    const [ranking, setRanking] = useState<OfficialTestRanking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        /**
         * Carrega o ranking sem tentar decidir permissões no browser.
         *
         * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
         */
        async function loadRanking(): Promise<void> {
            setIsLoading(true);
            setError(null);
            try {
                const loadedRanking = await getOfficialTestRanking(subjectId, testId);
                if (isActive) setRanking(loadedRanking);
            } catch (caught) {
                if (isActive) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível carregar o ranking.",
                    );
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        void loadRanking();

        return () => {
            isActive = false;
        };
    }, [subjectId, testId]);

    if (isLoading) {
        return (
            <p className="sf-notice text-sm text-studyflow-text">
                A carregar ranking do mini-teste.
            </p>
        );
    }

    if (error) {
        return (
            <section className="sf-surface space-y-3" role="alert">
                <h1 className="text-xl font-bold">Ranking indisponível</h1>
                <p className="sf-error">{error}</p>
            </section>
        );
    }

    if (!ranking || ranking.rows.length === 0) {
        return (
            <section className="sf-surface space-y-3">
                <h1 className="text-xl font-bold">Ranking do mini-teste</h1>
                <p className="text-sm text-studyflow-text">
                    Ainda não existem tentativas submetidas para este mini-teste.
                </p>
            </section>
        );
    }

    return (
        <section className="sf-surface space-y-4">
            <div>
                <h1 className="text-xl font-bold">Ranking do mini-teste</h1>
                <p className="text-sm text-studyflow-text">
                    Política BEST_ATTEMPT: surge apenas a melhor tentativa de cada aluno.
                    Em empate, conta a submissão mais antiga e depois um identificador
                    estável.
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <caption className="sr-only">
                        Ranking de mini-teste oficial da disciplina
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">Posição</th>
                            <th scope="col">Aluno</th>
                            <th scope="col">Pontuação</th>
                            <th scope="col">Respostas certas</th>
                            <th scope="col">Tentativas</th>
                            <th scope="col">Submissão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.rows.map((row) => (
                            <tr key={`${row.studentRef}-${row.bestAnsweredAt}`}>
                                <td>{row.position}</td>
                                <td>{row.displayName}</td>
                                <td>{row.bestPercentage}%</td>
                                <td>
                                    {row.bestCorrectAnswers}/{row.bestTotalQuestions}
                                </td>
                                <td>{row.attemptCount}</td>
                                <td>{new Date(row.bestAnsweredAt).toLocaleString("pt-PT")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
