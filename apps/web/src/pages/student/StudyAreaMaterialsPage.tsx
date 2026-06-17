/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { MaterialList } from "../../components/materials/MaterialList.js";
import { MaterialSubmitForm } from "../../components/materials/MaterialSubmitForm.js";
import { listMaterials, StudyMaterial } from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudyAreaMaterialsPageProps = {
    studyAreaId: string;
};

/**
 * Página de materiais de uma área.
 *
 * @param props Identificador da área.
 * @returns Submissão e lista de materiais.
 */
export function StudyAreaMaterialsPage({ studyAreaId }: StudyAreaMaterialsPageProps) {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);

    /**
     * Recarrega os materiais da área.
     *
     * @returns Promise resolvida depois de atualizar estado.
     */
    async function refresh(): Promise<void> {
        setMaterials(await listMaterials(studyAreaId));
    }

    useEffect(() => {
        void refresh();
    }, [studyAreaId]);

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <MaterialSubmitForm studyAreaId={studyAreaId} onSubmitted={refresh} />
            <div className="sf-panel space-y-4">
                <h1 className="text-xl font-bold">Materiais</h1>
                <MaterialList materials={materials} studyAreaId={studyAreaId} />
            </div>
        </section>
    );
}
