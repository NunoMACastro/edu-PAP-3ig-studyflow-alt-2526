// apps/web/src/features/privacy-data-exports/privacy-data-exports-panel.tsx
import { useEffect, useState } from "react";
import { DataExportRequest, downloadDataExport, loadDataExports, requestDataExport } from "./privacy-data-exports-client.js";

/**
 * Painel de privacidade para exportar dados pessoais.
 */
export function PrivacyDataExportsPanel() {
    const [items, setItems] = useState<DataExportRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDataExports().then(setItems).catch((err: Error) => setError(err.message));
    }, []);

    async function handleRequest() {
        const created = await requestDataExport("Pedido feito no painel de privacidade.");
        setItems((current) => [created, ...current]);
    }

    async function handleDownload(id: string) {
        const bundle = await downloadDataExport(id);
        const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
        // A URL temporária vive apenas no browser durante o clique.
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "studyflow-dados-pessoais.json";
        anchor.click();
        URL.revokeObjectURL(url);
    }

    return (
        <section aria-labelledby="privacy-export-title">
            <h2 id="privacy-export-title">Exportar dados pessoais</h2>
            {error ? <p role="alert">{error}</p> : null}
            <button type="button" onClick={handleRequest}>Pedir exportação</button>
            <ul>{items.map((item) => <li key={item.id}><button type="button" onClick={() => handleDownload(item.id)}>Descarregar {item.status}</button></li>)}</ul>
        </section>
    );
}