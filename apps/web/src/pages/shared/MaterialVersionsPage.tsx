/**
 * Implementa uma pagina React de shared com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import {
    createMaterialVersionFromJob,
    listMaterialVersions,
    MaterialVersion,
    restoreMaterialVersion,
} from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

/**
 * Página de gestão de versões produzidas por jobs de indexação concluídos.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function MaterialVersionsPage({ jobId }: { jobId: string }) {
    const [versions, setVersions] = useState<MaterialVersion[]>([]);
    const [title, setTitle] = useState("");
    const [changeSummary, setChangeSummary] = useState("");
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const action = useAsyncAction();

    useEffect(() => {
        void loadVersions();
    }, [jobId]);

    /**
     * Carrega shared no formato necessário ao próximo passo do fluxo.
     * @returns Entidade de shared já filtrada pelo contexto recebido.
     */
    async function loadVersions() {
        try {
            setLoading(true);
            setError(null);
            setVersions(await listMaterialVersions(jobId));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao carregar versões.",
            );
        } finally {
            setLoading(false);
        }
    }

    /**
     * Trata a interação do utilizador em shared, sincronizando formulário, estado e pedido à API.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    async function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await action.run("create-version", async () => {
            await createMaterialVersionFromJob(jobId, { title, changeSummary });
            setTitle("");
            setChangeSummary("");
            await loadVersions();
            setCreateOpen(false);
        }, "Erro ao criar versão.");
    }

    /**
     * Trata a interação do utilizador em shared, sincronizando formulário, estado e pedido à API.
     *
     * @param versionId Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Resultado da operação no formato esperado pelo chamador.
     */
    async function handleRestore(versionId: string) {
        await action.run(`restore-${versionId}`, async () => {
            await restoreMaterialVersion(jobId, versionId);
            await loadVersions();
        }, "Erro ao restaurar versão.");
    }

    return (
        <section className="space-y-6">
            <PageHeader
                action={<button aria-expanded={createOpen} className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Criar versão</button>}
                description="Consulta snapshots de indexação e restaura a versão ativa do material."
                title="Versões do material"
            />
            <AsyncStateBlock error={error ?? undefined} isEmpty={versions.length === 0} isLoading={loading} emptyMessage="Ainda não existem versões deste material">
                <div aria-label="Versões do material" className="space-y-3">
                    {versions.map((version) => (
                        <article className="sf-list-card space-y-2" key={version._id}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="break-words font-semibold">v{version.versionNumber} · {version.title}</h2>
                                    <p className="text-sm text-studyflow-text/70">{version.chunksSnapshot.length} blocos indexados</p>
                                </div>
                                <button className="sf-button-secondary" disabled={version.active || action.isPending} onClick={() => void handleRestore(version._id)} type="button">
                                    {version.active ? "Activa" : action.pendingKey === `restore-${version._id}` ? "A restaurar..." : "Restaurar"}
                                </button>
                            </div>
                            {version.changeSummary ? <p className="text-sm leading-6 text-studyflow-text/80">{version.changeSummary}</p> : null}
                        </article>
                    ))}
                </div>
            </AsyncStateBlock>
            {action.error && !createOpen ? <p className="sf-error" role="alert">{action.error}</p> : null}
            <SidePanel closeDisabled={action.isPending} description="Regista um snapshot do conteúdo indexado por este job." onClose={() => setCreateOpen(false)} open={createOpen} title="Criar versão">
                <form className="space-y-4" onSubmit={handleCreate}>
                    {action.error ? <p className="sf-error" role="alert">{action.error}</p> : null}
                    <FormField id="material-version-title" label="Título da versão">
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </FormField>
                    <FormField id="material-version-summary" label="Resumo das alterações">
                        <textarea
                            className="min-h-24"
                            value={changeSummary}
                            onChange={(event) => setChangeSummary(event.target.value)}
                        />
                    </FormField>
                    <button className="sf-button-primary" disabled={action.isPending} type="submit">
                        {action.pendingKey === "create-version" ? "A criar..." : "Criar versão"}
                    </button>
                </form>
            </SidePanel>
        </section>
    );
}
