/** Renderizador GFM seguro e comum a materiais privados, oficiais e salas. */
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownViewerProps = {
    source: string;
    className?: string;
};

/**
 * Renderiza Markdown sem HTML raw, embeds ou carregamento de imagens externas.
 *
 * @param props Fonte já autorizada e classes opcionais do contentor.
 * @returns Árvore React sem recurso a `dangerouslySetInnerHTML`.
 */
export function MarkdownViewer({ source, className = "" }: MarkdownViewerProps) {
    return (
        <div className={`sf-markdown min-w-0 break-words leading-7 ${className}`.trim()}>
            <ReactMarkdown
                components={MARKDOWN_COMPONENTS}
                remarkPlugins={[remarkGfm]}
                skipHtml
                urlTransform={safeMarkdownUrl}
            >
                {source}
            </ReactMarkdown>
        </div>
    );
}

/** Componentes fechados que impedem imagens e normalizam links externos. */
const MARKDOWN_COMPONENTS: Components = {
    h1: ({ children }) => (
        <h2 className="mb-4 mt-7 text-3xl font-bold leading-tight first:mt-0">{children}</h2>
    ),
    h2: ({ children }) => (
        <h3 className="mb-3 mt-6 text-2xl font-semibold leading-tight first:mt-0">{children}</h3>
    ),
    h3: ({ children }) => (
        <h4 className="mb-2 mt-5 text-xl font-semibold leading-tight first:mt-0">{children}</h4>
    ),
    h4: ({ children }) => <h5 className="mb-2 mt-4 text-lg font-semibold">{children}</h5>,
    h5: ({ children }) => <h6 className="mb-2 mt-4 font-semibold">{children}</h6>,
    h6: ({ children }) => <p className="mb-2 mt-4 font-semibold">{children}</p>,
    p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
    ul: ({ children, className }) => (
        <ul className={`${className ?? ""} my-3 list-disc space-y-1 pl-6`.trim()}>{children}</ul>
    ),
    ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>,
    li: ({ children, className }) => (
        <li className={`${className ?? ""} pl-1`.trim()}>{children}</li>
    ),
    input: ({ type, checked, node: _node, ...props }) => (
        <input
            {...props}
            aria-label={
                type === "checkbox"
                    ? checked
                        ? "Tarefa concluída"
                        : "Tarefa por concluir"
                    : undefined
            }
            checked={checked}
            className="mr-2 align-middle"
            disabled
            readOnly
            type={type}
        />
    ),
    hr: () => <hr className="my-6 border-studyflow-border/20" />,
    a: ({ href, children, node: _node, ...props }) => {
        const external = Boolean(href && /^https?:/iu.test(href));
        return (
            <a
                {...props}
                className="break-all text-studyflow-brandText underline underline-offset-2"
                href={href}
                rel={external ? "noopener noreferrer" : undefined}
                target={external ? "_blank" : undefined}
            >
                {children}
            </a>
        );
    },
    img: ({ src, alt }) => {
        const href = typeof src === "string" ? safeExternalImageUrl(src) : "";
        return href ? (
            <a
                className="break-all text-studyflow-brandText underline underline-offset-2"
                href={href}
                rel="noopener noreferrer"
                target="_blank"
            >
                {`Imagem externa: ${alt || href}`}
            </a>
        ) : (
            <span className="text-studyflow-text/70">Imagem externa bloqueada</span>
        );
    },
    table: ({ children }) => (
        <div
            aria-label="Tabela com deslocamento horizontal"
            className="my-4 overflow-x-auto"
            role="region"
            tabIndex={0}
        >
            <table className="w-full border-collapse text-left text-sm">{children}</table>
        </div>
    ),
    th: ({ children }) => (
        <th className="border border-studyflow-border/20 bg-studyflow-page/60 px-3 py-2 font-semibold">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="border border-studyflow-border/20 px-3 py-2 align-top">{children}</td>
    ),
    pre: ({ children }) => (
        <pre
            aria-label="Bloco de código com deslocamento horizontal"
            className="my-4 overflow-x-auto rounded-xl border border-studyflow-border/15 bg-studyflow-page p-4 text-sm text-studyflow-text"
            tabIndex={0}
        >
            {children}
        </pre>
    ),
    code: ({ className, children, node: _node, ...props }) => (
        <code
            {...props}
            className={`${className ?? ""} rounded bg-studyflow-page/70 px-1 py-0.5 font-mono text-sm`.trim()}
        >
            {children}
        </code>
    ),
    blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-4 border-studyflow-brand/50 pl-4 text-studyflow-text/80">
            {children}
        </blockquote>
    ),
};

/** Permite apenas protocolos e referências locais previstos no contrato. */
function safeMarkdownUrl(value: string): string {
    if (value.startsWith("#")) return value;
    if (!value.startsWith("//") && !/^[a-z][a-z\d+.-]*:/iu.test(value)) {
        try {
            new URL(value, window.location.origin);
            return value;
        } catch {
            return "";
        }
    }
    try {
        const protocol = new URL(value).protocol.toLowerCase();
        return ["http:", "https:", "mailto:"].includes(protocol) ? value : "";
    } catch {
        return "";
    }
}

/** Imagens são convertidas em links e aceitam apenas HTTP(S). */
function safeExternalImageUrl(value: string): string {
    try {
        return ["http:", "https:"].includes(new URL(value).protocol.toLowerCase())
            ? value
            : "";
    } catch {
        return "";
    }
}
