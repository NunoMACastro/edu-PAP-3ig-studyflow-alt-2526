/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { ResponsivePageFrame } from "../../components/layout/ResponsivePageFrame.js";
import { MaterialList } from "../../components/materials/MaterialList.js";
import { MaterialSubmitForm } from "../../components/materials/MaterialSubmitForm.js";
import { ExternalMaterialImportPanel } from "../../features/mf5/external-material-import-panel.js";
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega os materiais da área autenticada.
     *
     * @returns Promise resolvida depois de atualizar a lista visivel.
     */
    async function refresh(): Promise<void> {
        setIsLoading(true);
        setError(null);
        try {
            // O frontend so envia o studyAreaId; ownership continua validado pela sessao no backend.
            setMaterials(await listMaterials(studyAreaId));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível carregar materiais.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [studyAreaId]);

    const materialActions = (
        <div className="space-y-6">
            <MaterialSubmitForm studyAreaId={studyAreaId} onSubmitted={refresh} />
            <ExternalMaterialImportPanel
                targetId={studyAreaId}
                targetType="PRIVATE_STUDY_AREA"
                onImported={refresh}
            />
        </div>
    );

    const materialList = (
        <section className="sf-panel min-w-0 space-y-4">
            <div>
                <h2 className="text-lg font-bold">Materiais submetidos</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Estes materiais pertencem à tua área de estudo privada.
                </p>
            </div>

            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {isLoading ? (
                <p className="text-sm text-slate-600">A carregar materiais...</p>
            ) : null}
            {!isLoading && materials.length === 0 ? (
                <p className="text-sm text-slate-600">
                    Ainda não existem materiais nesta área. Usa o painel lateral para
                    adicionar ou importar o primeiro.
                </p>
            ) : null}
            {!isLoading && materials.length > 0 ? (
                <MaterialList materials={materials} studyAreaId={studyAreaId} />
            ) : null}
        </section>
    );

    return (
        <section className="space-y-6">
            <PageHeader
                title="Materiais"
                description="Consulta os materiais da tua área privada e adiciona tópicos, URLs, ficheiros ou links externos sem sair deste ecrã."
            />

            <ResponsivePageFrame
                aside={materialActions}
                asideLabel="Adicionar ou importar material"
                main={materialList}
            />
        </section>
    );
}
