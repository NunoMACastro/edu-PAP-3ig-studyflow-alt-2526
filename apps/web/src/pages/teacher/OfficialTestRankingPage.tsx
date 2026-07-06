// apps/web/src/pages/teacher/OfficialTestRankingPage.tsx
import { useEffect, useState } from "react";
import {
    getOfficialTestRanking,
    OfficialTestRanking,
} from "../../lib/apiClient.js";

type OfficialTestRankingPageProps = {
    subjectId: string;
    testId: string;
};

/**
 * Página docente de ranking de mini-testes oficiais.
 *
 * @param props Identificadores vindos da rota protegida.
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

        async function loadRanking(): Promise<void> {
            setIsLoading(true);
            setError(null);
            try {
                const loadedRanking = await getOfficialTestRanking(subjectId, testId);
                if (!isActive) return;
                setRanking(loadedRanking);
            } catch (caught) {
                if (!isActive) return;
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Não foi possível carregar o ranking.",
                );
            } finally {
                if (isActive) setIsLoading(false);
            }
        }

        // A página só pede dados; autorização e filtros continuam no backend.
        void loadRanking();

        return () => {
            isActive = false;
        };
    }, [subjectId, testId]);

    if (isLoading) {
        return <p className="sf-panel">A carregar ranking do mini-teste...</p>;
    }

    if (error) {
        return (
            <section className="sf-panel" role="alert">
                <h1 className="text-xl font-bold">Ranking indisponível</h1>
                <p className="sf-error">{error}</p>
            </section>
        );
    }

    if (!ranking || ranking.rows.length === 0) {
        return (
            <section className="sf-panel">
                <h1 className="text-xl font-bold">Ranking do mini-teste</h1>
                <p className="text-sm text-slate-600">
                    Ainda não existem tentativas submetidas para este mini-teste.
                </p>
            </section>
        );
    }

    return (
        <section className="sf-panel space-y-4">
            <div>
                <h1 className="text-xl font-bold">Ranking do mini-teste</h1>
                <p className="text-sm text-slate-600">
                    Resultados ordenados por pontuação. Em empate, aparece primeiro
                    quem submeteu mais cedo.
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
                            <th scope="col">Submissão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.rows.map((row) => (
                            <tr key={`${row.studentRef}-${row.answeredAt}`}>
                                <td>{row.position}</td>
                                <td>{row.displayName}</td>
                                <td>{row.percentage}%</td>
                                <td>
                                    {row.correctAnswers}/{row.totalQuestions}
                                </td>
                                <td>{new Date(row.answeredAt).toLocaleString("pt-PT")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}