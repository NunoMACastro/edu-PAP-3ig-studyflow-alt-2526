/**
 * Painel de privacidade e consentimentos MF4.
 */
import { useEffect, useState } from "react";
import {
    AiConsent,
    DataExportRequest,
    deleteAccount,
    downloadDataExport,
    grantAiConsent,
    listAiConsents,
    listDataExports,
    requestDataExport,
    revokeAiConsent,
} from "./mf4-client.js";

const purposes = ["PRIVATE_AREA_AI", "GROUP_AI", "CLASS_AI", "PROJECT_AI", "SUMMARY", "STUDY_TOOL"];

/**
 * UI de exportação, eliminação e consentimentos.
 *
 * @returns Painel de privacidade.
 */
export function PrivacyPanel() {
    const [exportsList, setExportsList] = useState<DataExportRequest[]>([]);
    const [consents, setConsents] = useState<AiConsent[]>([]);
    const [confirmation, setConfirmation] = useState("");
    const [bundle, setBundle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function refresh(): Promise<void> {
        const [nextExports, nextConsents] = await Promise.all([
            listDataExports(),
            listAiConsents(),
        ]);
        setExportsList(nextExports);
        setConsents(nextConsents);
    }

    useEffect(() => {
        refresh().catch((caught) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar privacidade."),
        );
    }, []);

    async function createExport(): Promise<void> {
        setError(null);
        await requestDataExport();
        await refresh();
    }

    async function download(id: string): Promise<void> {
        setError(null);
        const result = await downloadDataExport(id);
        setBundle(JSON.stringify(result, null, 2));
    }

    async function toggleConsent(purpose: string, granted: boolean): Promise<void> {
        setError(null);
        if (granted) await revokeAiConsent(purpose);
        else await grantAiConsent(purpose);
        await refresh();
    }

    async function removeAccount(): Promise<void> {
        setError(null);
        await deleteAccount(confirmation);
        window.location.href = "/";
    }

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Privacidade</h1>
                <p className="text-sm text-slate-600">Exportação, eliminação de conta e consentimentos de IA.</p>
            </header>
            {error ? <p className="sf-error">{error}</p> : null}

            <section className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Dados pessoais</h2>
                <button className="sf-button-primary" onClick={() => void createExport()}>
                    Pedir exportação
                </button>
                {exportsList.map((item) => (
                    <article className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3" key={item.id}>
                        <span className="text-sm">{item.status} · expira {new Date(item.expiresAt).toLocaleDateString("pt-PT")}</span>
                        <button className="sf-button-secondary" onClick={() => void download(item.id)}>
                            Ver JSON
                        </button>
                    </article>
                ))}
                {bundle ? <pre className="max-h-80 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-50">{bundle}</pre> : null}
            </section>

            <section className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Consentimentos IA</h2>
                {purposes.map((purpose) => {
                    const granted = consents.find((item) => item.purpose === purpose)?.status === "GRANTED";
                    return (
                        <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3" key={purpose}>
                            <span className="text-sm font-medium">{purpose}</span>
                            <input type="checkbox" checked={granted} onChange={() => void toggleConsent(purpose, granted)} />
                        </label>
                    );
                })}
            </section>

            <section className="sf-panel space-y-3 border-red-200">
                <h2 className="text-lg font-semibold text-red-700">Eliminar conta</h2>
                <input
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    placeholder="ELIMINAR A MINHA CONTA"
                />
                <button className="sf-button-secondary" disabled={confirmation !== "ELIMINAR A MINHA CONTA"} onClick={() => void removeAccount()}>
                    Eliminar conta
                </button>
            </section>
        </section>
    );
}
