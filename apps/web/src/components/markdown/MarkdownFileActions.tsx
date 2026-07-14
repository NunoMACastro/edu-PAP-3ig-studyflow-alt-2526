/** Ações consistentes para abrir, editar e descarregar Markdown protegido. */
import { Link } from "react-router-dom";

export function MarkdownFileActions({
    viewTo,
    downloadHref,
    editTo,
}: {
    viewTo?: string;
    downloadHref: string;
    editTo?: string;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {viewTo ? <Link className="sf-button-secondary" to={viewTo}>Abrir</Link> : null}
            {editTo ? <Link className="sf-button-secondary" to={editTo}>Editar</Link> : null}
            <a className="sf-button-secondary" href={downloadHref}>Descarregar .md</a>
        </div>
    );
}
