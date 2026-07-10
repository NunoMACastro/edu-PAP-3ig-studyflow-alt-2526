/**
 * Implementa uma pagina React de shared com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
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
            setError(null);
            setVersions(await listMaterialVersions(jobId));
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao carregar versões.",
            );
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
        <section className="space-y-4">
            <h1 className="text-xl font-bold">Versões do material</h1>
            {error || action.error ? <p className="sf-error" role="alert">{action.error ?? error}</p> : null}
            <form className="sf-panel space-y-3" onSubmit={handleCreate}>
                <label className="block space-y-2">
                    <span>Título da versão</span>
                    <input
                        className="sf-input"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </label>
                <label className="block space-y-2">
                    <span>Resumo das alterações</span>
                    <textarea
                        className="sf-input min-h-24"
                        value={changeSummary}
                        onChange={(event) => setChangeSummary(event.target.value)}
                    />
                </label>
                <button className="sf-button-primary" disabled={action.isPending} type="submit">
                    {action.pendingKey === "create-version" ? "A criar..." : "Criar versão"}
                </button>
            </form>

            <div className="space-y-3">
                {versions.map((version) => (
                    <article className="sf-panel space-y-2" key={version._id}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="font-semibold">
                                    v{version.versionNumber} · {version.title}
                                </p>
                                <p className="text-sm text-studyflow-text">
                                    {version.chunksSnapshot.length} blocos indexados
                                </p>
                            </div>
                            <button
                                className="sf-button-secondary"
                                disabled={version.active || action.isPending}
                                onClick={() => void handleRestore(version._id)}
                                type="button"
                            >
                                {version.active
                                    ? "Activa"
                                    : action.pendingKey === `restore-${version._id}`
                                      ? "A restaurar..."
                                      : "Restaurar"}
                            </button>
                        </div>
                        {version.changeSummary ? (
                            <p className="text-sm text-studyflow-text">{version.changeSummary}</p>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
