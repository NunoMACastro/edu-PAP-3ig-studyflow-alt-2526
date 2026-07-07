import { useMemo } from "react";
import {
    buildMockupAlignmentChecklist,
    summarizeMockupAlignment,
    validateMockupAlignmentChecklist,
    type MockupAlignmentItem,
    type MockupAlignmentStatus,
} from "./mockup-alignment.js";

const statusLabel: Record<MockupAlignmentStatus, string> = {
    PENDENTE: "Pendente",
    VALIDADO: "Validado",
    BLOQUEADO: "Bloqueado",
};

/**
 * Devolve classes visuais para cada estado sem alterar o contrato funcional.
 *
 * @param status Estado de revisão visual do item.
 * @returns Classes Tailwind usadas no badge do estado.
 */
function getStatusClassName(status: MockupAlignmentStatus): string {
    if (status === "VALIDADO") {
        return "bg-emerald-100 text-emerald-800";
    }

    if (status === "BLOQUEADO") {
        return "bg-rose-100 text-rose-800";
    }

    return "bg-amber-100 text-amber-900";
}

/**
 * Renderiza um item individual da checklist.
 *
 * @param props Dados do item visual.
 * @returns Cartão com rota, foco de mockup e evidence esperada.
 */
function MockupAlignmentCard({ item }: { item: MockupAlignmentItem }) {
    return (
        <article className="sf-panel space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="font-semibold text-slate-950">{item.screen}</h3>
                    <p className="text-sm text-slate-600">{item.mockupFocus}</p>
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(item.status)}`}
                >
                    {statusLabel[item.status]}
                </span>
            </div>

            <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div>
                    <dt className="font-medium text-slate-700">Rota real</dt>
                    <dd>
                        <a className="text-studyflow-brand underline" href={item.realPath}>
                            {item.realPath}
                        </a>
                    </dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-700">Estado esperado</dt>
                    <dd className="text-slate-600">{item.expectedState}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-700">Evidence</dt>
                    <dd className="text-slate-600">{item.evidence}</dd>
                </div>
            </dl>
        </article>
    );
}

/**
 * Painel de fecho visual para RNF38.
 *
 * @returns Checklist de aproximação ao mockup com rotas reais e validação local.
 */
export function MockupAlignmentPanel() {
    const items = useMemo(() => buildMockupAlignmentChecklist(), []);
    const summary = useMemo(() => summarizeMockupAlignment(items), [items]);
    const validationErrors = useMemo(
        () => validateMockupAlignmentChecklist(items),
        [items],
    );

    return (
        <section className="space-y-4" aria-labelledby="mockup-alignment-title">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase text-studyflow-brand">
                        MF8 · RNF38
                    </p>
                    <h2 id="mockup-alignment-title" className="text-xl font-bold text-slate-950">
                        Alinhamento ao mockup
                    </h2>
                    <p className="max-w-3xl text-sm text-slate-600">
                        Checklist de fecho visual ligada a páginas reais e a evidence sem dados
                        sensíveis.
                    </p>
                </div>
                <dl className="sf-panel grid min-w-56 grid-cols-2 gap-2 text-sm">
                    <div>
                        <dt className="font-medium text-slate-700">Total</dt>
                        <dd className="text-slate-950">{summary.total}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-slate-700">Pendentes</dt>
                        <dd className="text-slate-950">{summary.pending}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-slate-700">Validados</dt>
                        <dd className="text-slate-950">{summary.validated}</dd>
                    </div>
                    <div>
                        <dt className="font-medium text-slate-700">Bloqueados</dt>
                        <dd className="text-slate-950">{summary.blocked}</dd>
                    </div>
                </dl>
            </div>

            {validationErrors.length > 0 ? (
                <div className="sf-error" role="alert">
                    <p className="font-semibold">Corrige a checklist antes de recolher evidence.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                        {validationErrors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            <div className="grid gap-3">
                {items.map((item) => (
                    <MockupAlignmentCard item={item} key={item.id} />
                ))}
            </div>
        </section>
    );
}
