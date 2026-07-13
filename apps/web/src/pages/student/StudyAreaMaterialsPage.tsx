/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { StudyAreaWorkspaceHeader } from "../../components/student/StudyAreaWorkspaceHeader.js";
import { MaterialList } from "../../components/materials/MaterialList.js";
import { MaterialSubmitForm } from "../../components/materials/MaterialSubmitForm.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
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
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

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

    const materialList = (
        <section className="sf-surface min-w-0 space-y-4">
            <div>
                <h2 className="text-lg font-bold">Materiais submetidos</h2>
                <p className="mt-1 text-sm text-studyflow-text">
                    Estes materiais pertencem à tua área de estudo privada.
                </p>
            </div>

            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            {isLoading ? (
                <p className="text-sm text-studyflow-text">A carregar materiais...</p>
            ) : null}
            {!isLoading && materials.length === 0 ? (
                <p className="text-sm text-studyflow-text">
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
            <StudyAreaWorkspaceHeader active="materials" studyAreaId={studyAreaId} />
            <div className="flex flex-wrap gap-2"><button aria-expanded={createOpen} className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Novo material</button><button aria-expanded={importOpen} className="sf-button-secondary" onClick={() => setImportOpen(true)} type="button">Importar link</button></div>

            {materialList}
            <SidePanel closeDisabled={isSubmitting} description="Adiciona um tópico, URL ou ficheiro à área privada." onClose={() => setCreateOpen(false)} open={createOpen} title="Novo material">
                <MaterialSubmitForm
                    studyAreaId={studyAreaId}
                    onSubmitted={async () => {
                        await refresh();
                        setCreateOpen(false);
                    }}
                    onSubmittingChange={setIsSubmitting}
                />
            </SidePanel>
            <SidePanel closeDisabled={isImporting} description="Importa uma referência Google Drive ou OneDrive." onClose={() => setImportOpen(false)} open={importOpen} title="Importar link externo">
                <ExternalMaterialImportPanel
                    targetId={studyAreaId}
                    targetType="PRIVATE_STUDY_AREA"
                    onImported={async () => {
                        await refresh();
                        setImportOpen(false);
                    }}
                    onSubmittingChange={setIsImporting}
                />
            </SidePanel>
        </section>
    );
}
