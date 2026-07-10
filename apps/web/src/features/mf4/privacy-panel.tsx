/**
 * Painel de privacidade e consentimentos MF4.
 */
import { useEffect, useState } from "react";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
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

const purposes = [
    "PRIVATE_AREA_AI",
    "GROUP_AI",
    "CLASS_AI",
    "PROJECT_AI",
    "SOURCE_GROUNDED_AI",
    "EXTERNAL_KNOWLEDGE_AI",
    "ADAPTIVE_EXPLANATION",
    "SUMMARY",
    "STUDY_TOOL",
    "ROOM_AI",
] as const;

/**
 * UI de exportação, eliminação e consentimentos.
 *
 * @returns Painel de privacidade.
 */
export function PrivacyPanel() {
    const [exportsList, setExportsList] = useState<DataExportRequest[]>([]);
    const [consents, setConsents] = useState<AiConsent[]>([]);
    const [confirmation, setConfirmation] = useState("");
    const [loadError, setLoadError] = useState<string | null>(null);
    const action = useAsyncAction();
    const pendingAction = action.pendingKey;

    /**
     * Recarrega a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
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
            setLoadError(
                caught instanceof Error
                    ? caught.message
                    : "Erro ao carregar privacidade.",
            ),
        );
    }, []);

    /**
     * Cria a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function createExport(): Promise<void> {
        await action.run("create-export", async () => {
            await requestDataExport();
            await refresh();
        }, "Não foi possível pedir a exportação.");
    }

    /**
     * Descarrega download para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param id Identificador usado para localizar o recurso correto e validar o acesso ao seu âmbito.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function download(id: string): Promise<void> {
        await action.run(`download-${id}`, async () => {
            const result = await downloadDataExport(id);
            downloadJsonFile(result, `studyflow-export-${id}.json`);
        }, "Não foi possível descarregar a exportação.");
    }

    /**
     * Transforma a ação de interface ligada a interface MF4, sincronizando dados remotos, estado local e mensagens visíveis ao utilizador.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @param purpose Finalidade de IA usada para escolher política, consentimento ou quota aplicável.
     * @param granted Valor de granted usado pela função para executar toggle consent com dados explícitos.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function toggleConsent(purpose: string, granted: boolean): Promise<void> {
        await action.run(`consent-${purpose}`, async () => {
            if (granted) await revokeAiConsent(purpose);
            else await grantAiConsent(purpose);
            await refresh();
        }, "Não foi possível atualizar o consentimento.");
    }

    /**
     * Remove remove account para interface MF4, escondendo os detalhes técnicos atrás de uma API simples para a interface.
     * Este fluxo preserva privacidade ao limitar exposição ou transformação de dados pessoais ao necessário.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function removeAccount(): Promise<void> {
        await action.run("delete-account", async () => {
            await deleteAccount(confirmation);
            window.location.assign("/");
        }, "Não foi possível eliminar a conta.");
    }

    return (
        <section className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-studyflow-text">Privacidade</h1>
                <p className="text-sm text-studyflow-text">Exportação, eliminação de conta e consentimentos de IA.</p>
            </header>
            {loadError || action.error ? (
                <p className="sf-error" role="alert">
                    {action.error ?? loadError}
                </p>
            ) : null}

            <section className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Dados pessoais</h2>
                <button className="sf-button-primary" disabled={Boolean(pendingAction)} onClick={() => void createExport()}>
                    {pendingAction === "create-export" ? "A pedir..." : "Pedir exportação"}
                </button>
                {exportsList.map((item) => (
                    <article className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-studyflow-border p-3" key={item.id}>
                        <span className="text-sm">{exportStatusLabel(item.status)} · expira {new Date(item.expiresAt).toLocaleDateString("pt-PT")}</span>
                        <button className="sf-button-secondary" disabled={Boolean(pendingAction)} onClick={() => void download(item.id)}>
                            {pendingAction === `download-${item.id}` ? "A descarregar..." : "Descarregar JSON"}
                        </button>
                    </article>
                ))}
            </section>

            <section className="sf-panel space-y-3">
                <h2 className="text-lg font-semibold">Consentimentos IA</h2>
                {purposes.map((purpose) => {
                    const granted = consents.find((item) => item.purpose === purpose)?.status === "GRANTED";
                    return (
                        <label className="flex items-center justify-between gap-3 rounded-md border border-studyflow-border p-3" key={purpose}>
                            <span className="text-sm font-medium">{purposeLabel(purpose)}</span>
                            <input
                                aria-label={`Consentimento: ${purposeLabel(purpose)}`}
                                className="h-5 w-5"
                                disabled={Boolean(pendingAction)}
                                type="checkbox"
                                checked={granted}
                                onChange={() => void toggleConsent(purpose, granted)}
                            />
                        </label>
                    );
                })}
            </section>

            <section className="sf-panel space-y-3 border-studyflow-alert">
                <h2 className="text-lg font-semibold text-studyflow-alertText">Eliminar conta</h2>
                <label className="block space-y-2" htmlFor="delete-account-confirmation">
                    <span>Escreve “ELIMINAR A MINHA CONTA” para confirmar</span>
                    <input
                        id="delete-account-confirmation"
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
                        placeholder="ELIMINAR A MINHA CONTA"
                    />
                </label>
                <button className="sf-button-secondary" disabled={confirmation !== "ELIMINAR A MINHA CONTA" || Boolean(pendingAction)} onClick={() => void removeAccount()}>
                    {pendingAction === "delete-account" ? "A eliminar..." : "Eliminar conta"}
                </button>
            </section>
        </section>
    );
}

/** Traduz o estado técnico de uma exportação de dados. */
function exportStatusLabel(status: DataExportRequest["status"]): string {
    if (status === "READY") return "Pronta";
    return "Expirada";
}

/**
 * Cria um download real para o bundle JSON sem o manter no DOM ou histórico visual.
 *
 * @param value Bundle devolvido pela API.
 * @param fileName Nome local seguro.
 */
function downloadJsonFile(value: unknown, fileName: string): void {
    const blob = new Blob([JSON.stringify(value, null, 2)], {
        type: "application/json;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

/**
 * Traduz finalidades técnicas para etiquetas compreensíveis.
 */
function purposeLabel(purpose: string): string {
    const labels: Record<string, string> = {
        PRIVATE_AREA_AI: "IA da área privada",
        GROUP_AI: "IA dos grupos de estudo",
        CLASS_AI: "IA das disciplinas",
        PROJECT_AI: "IA dos projetos",
        SOURCE_GROUNDED_AI: "IA baseada nas fontes autorizadas",
        EXTERNAL_KNOWLEDGE_AI: "IA com conhecimento externo",
        ADAPTIVE_EXPLANATION: "Explicações adaptativas",
        SUMMARY: "Geração de resumos",
        STUDY_TOOL: "Ferramentas de estudo",
        ROOM_AI: "IA das salas de estudo",
    };
    return labels[purpose] ?? purpose;
}
