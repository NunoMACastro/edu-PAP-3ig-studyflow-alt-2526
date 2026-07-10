/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { StudyAreaForm } from "../../components/study/StudyAreaForm.js";
import { createStudyArea, listStudyAreas, StudyArea } from "../../lib/apiClient.js";

/**
 * Página de criação e listagem de áreas de estudo.
 *
 * @returns Gestão simples de áreas pessoais.
 */
export function StudyAreasPage() {
    const [areas, setAreas] = useState<StudyArea[]>([]);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega áreas da API.
     *
     * @returns Promise resolvida depois de atualizar estado.
     */
    async function refresh(): Promise<void> {
        setAreas(await listStudyAreas());
    }

    useEffect(() => {
        void refresh();
    }, []);

    /**
     * Cria uma nova área.
     *
     * @param input Dados editáveis da área.
     * @returns Verdadeiro quando a criação conclui.
     */
    async function handleSubmit(input: {
        name: string;
        description: string;
    }): Promise<boolean> {
        setError(null);
        try {
            await createStudyArea(input);
            await refresh();
            return true;
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar.");
            return false;
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="sf-panel space-y-4" id="criar-area">
                <h1 className="text-xl font-bold">Áreas de estudo</h1>
                <StudyAreaForm
                    error={error}
                    onSubmit={handleSubmit}
                    submitLabel="Criar área"
                />
            </div>
            <div className="grid gap-3">
                {areas.map((area) => (
                    <a className="sf-panel block hover:border-studyflow-brand" href={`/app/areas/${area._id}`} key={area._id}>
                        <h2 className="font-semibold">{area.name}</h2>
                        {area.description ? <p className="mt-1 text-sm text-studyflow-text">{area.description}</p> : null}
                    </a>
                ))}
            </div>
        </section>
    );
}
