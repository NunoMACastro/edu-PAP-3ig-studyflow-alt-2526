// apps/web/src/pages/student/StudyAreaMaterialsPage.tsx
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { ResponsivePageFrame } from "../../components/layout/ResponsivePageFrame.js";
import { MaterialList } from "../../components/materials/MaterialList.js";
import { MaterialSubmitForm } from "../../components/materials/MaterialSubmitForm.js";
import { listMaterials, StudyMaterial } from "../../lib/apiClient.js";

/**
 * Props da página de materiais privados.
 */
type StudyAreaMaterialsPageProps = {
    /** Identificador da área validado pela rota protegida e pelo backend. */
    studyAreaId: string;
};

/**
 * Mostra materiais de uma área de estudo e o formulário para adicionar novos materiais.
 *
 * @param props Identificador da área de estudo privada.
 * @returns Página responsiva de materiais privados.
 */
export function StudyAreaMaterialsPage({ studyAreaId }: StudyAreaMaterialsPageProps) {
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega materiais da área autenticada.
     *
     * @returns Promise resolvida depois de atualizar a lista visível.
     */
    async function refresh(): Promise<void> {
        setIsLoading(true);
        setError(null);
        try {
            // O frontend só envia o studyAreaId; o backend continua a validar ownership pela sessão.
            setMaterials(await listMaterials(studyAreaId));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível carregar materiais.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void refresh();
    }, [studyAreaId]);

    const materialList = (
        <section className="sf-panel min-w-0 space-y-4">
            <div>
                <h2 className="text-lg font-bold">Materiais submetidos</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Estes materiais pertencem à tua área de estudo privada.
                </p>
            </div>

            {error ? <p className="sf-error">{error}</p> : null}
            {isLoading ? <p className="text-sm text-slate-600">A carregar materiais...</p> : null}
            {!isLoading && materials.length === 0 ? (
                <p className="text-sm text-slate-600">
                    Ainda não existem materiais nesta área. Usa o formulário para adicionar o primeiro.
                </p>
            ) : null}
            {!isLoading && materials.length > 0 ? (
                // A lista fica dentro do bloco principal para o aluno ver primeiro o que já existe.
                <MaterialList materials={materials} studyAreaId={studyAreaId} />
            ) : null}
        </section>
    );

    return (
        <section className="space-y-6">
            <PageHeader
                title="Materiais da área"
                description="Consulta os materiais já associados à tua área e adiciona novos tópicos, URLs ou ficheiros sem sair deste ecrã."
            />

            <ResponsivePageFrame
                aside={<MaterialSubmitForm studyAreaId={studyAreaId} onSubmitted={refresh} />}
                asideLabel="Adicionar material"
                main={materialList}
            />
        </section>
    );
}