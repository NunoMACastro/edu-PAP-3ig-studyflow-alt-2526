/**
 * Implementa uma pagina React de shared com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import {
    listPrivateMaterialContext,
    listSubjectMaterialContext,
    MaterialContextItem,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de shared; mantêm explícitas as dependências vindas da página.
 */
type MaterialContextsPageProps = {
    contextType: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    contextId: string;
};

/**
 * Página de consulta dos contexts autorizados de materiais para IA.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function MaterialContextsPage({
    contextType,
    contextId,
}: MaterialContextsPageProps) {
    const [items, setItems] = useState<MaterialContextItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
                /**
         * Carrega shared no formato necessário ao próximo passo do fluxo.
         * @returns Entidade de shared já filtrada pelo contexto recebido.
         */
        async function loadContexts() {
            try {
                setError(null);
                const response =
                    contextType === "PRIVATE_AREA"
                        ? await listPrivateMaterialContext(contextId)
                        : await listSubjectMaterialContext(contextId);
                setItems(response.contexts);
            } catch (caught) {
                setError(
                    caught instanceof Error
                        ? caught.message
                        : "Erro ao carregar contexts de materiais.",
                );
            }
        }

        void loadContexts();
    }, [contextId, contextType]);

    return (
        <section className="space-y-4">
            <h1 className="text-xl font-bold">Contexts de materiais</h1>
            {error ? <p className="sf-error">{error}</p> : null}
            <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <article className="sf-panel" key={item._id}>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">
                            {item.scope === "PRIVATE_AREA"
                                ? "Área privada"
                                : "Disciplina oficial"}{" "}
                            · {item.source}
                        </p>
                        <p className="mt-2 break-all text-xs text-slate-500">
                            Material: {item.materialId}
                        </p>
                    </article>
                ))}
            </div>
            {items.length === 0 && !error ? (
                <p className="sf-panel text-sm text-slate-600">
                    Ainda não existem materiais neste contexto.
                </p>
            ) : null}
        </section>
    );
}
