/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { StudyHistoryList } from "../../components/study/StudyHistoryList.js";
import { listStudyHistory } from "../../lib/apiClient.js";

/**
 * Página do histórico de estudo.
 *
 * @returns Histórico pessoal do aluno.
 */
export function StudyHistoryPage() {
    const [events, setEvents] = useState<unknown[]>([]);

    useEffect(() => {
        void listStudyHistory().then(setEvents);
    }, []);

    return (
        <section className="sf-panel space-y-4">
            <h1 className="text-xl font-bold">Histórico</h1>
            <StudyHistoryList events={events} />
        </section>
    );
}
