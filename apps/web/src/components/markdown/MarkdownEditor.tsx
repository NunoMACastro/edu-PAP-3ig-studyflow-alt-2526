/** Editor Markdown explícito com preview seguro e proteção contra perda local. */
import { useEffect, useRef, useState } from "react";
import { MarkdownViewer } from "./MarkdownViewer.js";

type MarkdownEditorProps = {
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    isDirty: boolean;
    isSaving?: boolean;
    error?: string | null;
    saveLabel?: string;
};

type ToolbarAction = {
    label: string;
    prefix: string;
    suffix?: string;
    placeholder: string;
};

const TOOLBAR_ACTIONS: ToolbarAction[] = [
    { label: "Título", prefix: "## ", placeholder: "Título" },
    { label: "Negrito", prefix: "**", suffix: "**", placeholder: "texto" },
    { label: "Itálico", prefix: "_", suffix: "_", placeholder: "texto" },
    { label: "Lista", prefix: "- ", placeholder: "item" },
    { label: "Tarefa", prefix: "- [ ] ", placeholder: "tarefa" },
    { label: "Citação", prefix: "> ", placeholder: "citação" },
    { label: "Código", prefix: "`", suffix: "`", placeholder: "código" },
    { label: "Ligação", prefix: "[", suffix: "](https://)", placeholder: "texto" },
    {
        label: "Tabela",
        prefix: "",
        placeholder: "| Coluna 1 | Coluna 2 |\n| --- | --- |\n| Valor 1 | Valor 2 |",
    },
];

/**
 * Edita a fonte e apresenta o mesmo renderer usado na leitura final.
 *
 * @param props Estado controlado, callback de gravação e erro público.
 * @returns Editor acessível com layout dividido no desktop e tabs no mobile.
 */
export function MarkdownEditor({
    value,
    onChange,
    onSave,
    isDirty,
    isSaving = false,
    error,
    saveLabel = "Guardar",
}: MarkdownEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const errorRef = useRef<HTMLParagraphElement>(null);
    const [mobileTab, setMobileTab] = useState<"EDIT" | "PREVIEW">("EDIT");
    const characters = Array.from(value).length;
    const bytes = new TextEncoder().encode(value).byteLength;

    useUnsavedChangesWarning(isDirty);

    useEffect(() => {
        if (error) errorRef.current?.focus();
    }, [error]);

    useEffect(() => {
        const handleSaveShortcut = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                if (!isSaving) onSave();
            }
        };
        window.addEventListener("keydown", handleSaveShortcut);
        return () => window.removeEventListener("keydown", handleSaveShortcut);
    }, [isSaving, onSave]);

    function applyAction(action: ToolbarAction): void {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.slice(start, end) || action.placeholder;
        const replacement = `${action.prefix}${selected}${action.suffix ?? ""}`;
        onChange(`${value.slice(0, start)}${replacement}${value.slice(end)}`);
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + action.prefix.length, start + action.prefix.length + selected.length);
        });
    }

    return (
        <div className="space-y-4">
            {error ? (
                <p className="sf-error" ref={errorRef} role="alert" tabIndex={-1}>
                    {error}
                </p>
            ) : null}
            <div aria-label="Ferramentas Markdown" className="flex flex-wrap gap-2" role="toolbar">
                {TOOLBAR_ACTIONS.map((action) => (
                    <button
                        className="sf-button-secondary px-3 py-2 text-sm"
                        disabled={isSaving}
                        key={action.label}
                        onClick={() => applyAction(action)}
                        type="button"
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 md:hidden" role="tablist" aria-label="Modo do editor">
                <button aria-selected={mobileTab === "EDIT"} className={mobileTab === "EDIT" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setMobileTab("EDIT")} role="tab" type="button">Editar</button>
                <button aria-selected={mobileTab === "PREVIEW"} className={mobileTab === "PREVIEW" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setMobileTab("PREVIEW")} role="tab" type="button">Pré-visualizar</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className={mobileTab === "EDIT" ? "block" : "hidden md:block"}>
                    <label className="mb-2 block text-sm font-semibold" htmlFor="markdown-source">Fonte Markdown</label>
                    <textarea
                        aria-describedby="markdown-limits"
                        aria-invalid={Boolean(error)}
                        className="min-h-96 w-full resize-y font-mono text-sm leading-6"
                        disabled={isSaving}
                        id="markdown-source"
                        maxLength={20_000}
                        onChange={(event) => onChange(event.target.value)}
                        ref={textareaRef}
                        spellCheck
                        value={value}
                    />
                    <p className="mt-2 text-xs text-studyflow-text/70" id="markdown-limits">
                        {characters.toLocaleString("pt-PT")}/20 000 caracteres · {bytes.toLocaleString("pt-PT")}/131 072 bytes
                    </p>
                </div>
                <section aria-label="Pré-visualização Markdown" className={`${mobileTab === "PREVIEW" ? "block" : "hidden md:block"} min-h-96 rounded-xl border border-studyflow-border/15 bg-studyflow-page/30 p-4`}>
                    {value.trim() ? <MarkdownViewer source={value} /> : <p className="text-sm text-studyflow-text/60">A pré-visualização aparece aqui.</p>}
                </section>
            </div>
            <button className="sf-button-primary" disabled={isSaving || !isDirty} onClick={onSave} type="button">
                {isSaving ? "A guardar..." : saveLabel}
            </button>
        </div>
    );
}

/** Protege reload, fecho e navegação por links internos quando há alterações. */
function useUnsavedChangesWarning(isDirty: boolean): void {
    useEffect(() => {
        if (!isDirty) return;
        const beforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        const click = (event: MouseEvent) => {
            const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
            if (!(target instanceof HTMLAnchorElement) || target.target === "_blank") return;
            if (!window.confirm("Tens alterações Markdown por guardar. Queres sair mesmo assim?")) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        window.addEventListener("beforeunload", beforeUnload);
        document.addEventListener("click", click, true);
        return () => {
            window.removeEventListener("beforeunload", beforeUnload);
            document.removeEventListener("click", click, true);
        };
    }, [isDirty]);
}
