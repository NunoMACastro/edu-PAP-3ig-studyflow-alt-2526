/**
 * Implementa uma pagina React de shared com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
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
 * Página de consulta dos contextos autorizados de materiais para IA.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function MaterialContextsPage({
    contextType,
    contextId,
}: MaterialContextsPageProps) {
    const [items, setItems] = useState<MaterialContextItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
                /**
         * Carrega shared no formato necessário ao próximo passo do fluxo.
         * @returns Entidade de shared já filtrada pelo contexto recebido.
         */
        async function loadContexts() {
            try {
                setLoading(true);
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
                        : "Erro ao carregar contextos de materiais.",
                );
            } finally {
                setLoading(false);
            }
        }

        void loadContexts();
    }, [contextId, contextType]);

    return (
        <section className="space-y-6">
            <PageHeader
                description="Consulta os materiais autorizados para fundamentar respostas e ferramentas de IA neste contexto."
                title={contextType === "OFFICIAL_SUBJECT" ? "Fontes da IA" : "Contextos de materiais"}
            />
            <AsyncStateBlock error={error ?? undefined} isEmpty={items.length === 0} isLoading={loading} emptyMessage="Ainda não existem materiais neste contexto">
                <div aria-label="Materiais autorizados" className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <article className="sf-list-card min-w-0" key={item._id}>
                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="mt-1 text-sm text-studyflow-text">
                            {item.scope === "PRIVATE_AREA"
                                ? "Área privada"
                                : "Disciplina oficial"}{" "}
                            · {item.source}
                        </p>
                    </article>
                ))}
                </div>
            </AsyncStateBlock>
        </section>
    );
}
