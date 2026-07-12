/**
 * Painel de privacidade e consentimentos MF4.
 */
import { useEffect, useState } from "react";
import { InlineNotice, SectionHeader } from "../../components/ui/CalmUi.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import {
    AiConsentCapability,
    DataExportRequest,
    deleteAccount,
    downloadDataExport,
    grantAiConsent,
    listAiConsentCapabilities,
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
    const [capabilities, setCapabilities] = useState<AiConsentCapability[]>([]);
    const [confirmation, setConfirmation] = useState("");
    const [isLoading, setIsLoading] = useState(true);
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
        const [nextExports, nextCapabilities] = await Promise.all([
            listDataExports(),
            listAiConsentCapabilities(),
        ]);
        setExportsList(nextExports);
        setCapabilities(nextCapabilities);
    }

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        refresh()
            .catch((caught) => {
                if (active) {
                    setLoadError(caught instanceof Error ? caught.message : "Erro ao carregar privacidade.");
                }
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
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
        <div className="space-y-6">
            {loadError || action.error ? (
                <InlineNotice tone="danger">{action.error ?? loadError}</InlineNotice>
            ) : null}
            {isLoading ? <InlineNotice>A carregar definições de privacidade...</InlineNotice> : null}

            {!isLoading ? <>
            <section className="sf-section-group space-y-4">
                <SectionHeader description="Pede uma cópia dos dados associados à tua conta." title="Dados pessoais" />
                <button className="sf-button-primary" disabled={Boolean(pendingAction)} onClick={() => void createExport()}>
                    {pendingAction === "create-export" ? "A pedir..." : "Pedir exportação"}
                </button>
                {exportsList.map((item) => (
                    <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3" key={item.id}>
                        <span className="text-sm">{exportStatusLabel(item.status)} · expira {new Date(item.expiresAt).toLocaleDateString("pt-PT")}</span>
                        <button className="sf-button-secondary" disabled={Boolean(pendingAction)} onClick={() => void download(item.id)}>
                            {pendingAction === `download-${item.id}` ? "A descarregar..." : "Descarregar JSON"}
                        </button>
                    </article>
                ))}
                {exportsList.length === 0 ? <InlineNotice>Ainda não pediste nenhuma exportação.</InlineNotice> : null}
            </section>

            <section className="sf-section-group space-y-4">
                <SectionHeader description="Ativa ou revoga cada finalidade sem alterar as restantes." title="Consentimentos IA" />
                {purposes.map((purpose) => {
                    const capability = capabilities.find((item) => item.purpose === purpose);
                    const granted = capability?.canUse === true;
                    const consentId = `ai-consent-${purpose.toLocaleLowerCase("pt-PT").replaceAll("_", "-")}`;
                    return (
                        <label className="flex items-center justify-between gap-3 rounded-xl border border-studyflow-border/10 bg-studyflow-page/35 p-3" htmlFor={consentId} key={purpose}>
                            <span>
                                <span className="block text-sm font-medium">{purposeLabel(purpose)}</span>
                                <span className="block text-xs text-studyflow-text/65">
                                    {consentStateLabel(capability?.state)}
                                </span>
                            </span>
                            <input
                                aria-label={`Consentimento: ${purposeLabel(purpose)}`}
                                className="h-5 w-5"
                                disabled={Boolean(pendingAction)}
                                type="checkbox"
                                id={consentId}
                                checked={granted}
                                onChange={() => void toggleConsent(purpose, granted)}
                            />
                        </label>
                    );
                })}
            </section>

            <section className="sf-section-group space-y-4 border-studyflow-alert/55 bg-studyflow-alert/10">
                <SectionHeader description="Esta operação elimina a conta através do fluxo protegido do backend." title="Eliminar conta" />
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
            </> : null}
        </div>
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
        CLASS_AI: "IA da turma, disciplinas e salas guiadas supervisionadas",
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

/** Traduz o estado efetivo calculado pelo backend sem duplicar versões de política. */
function consentStateLabel(state?: AiConsentCapability["state"]): string {
    if (state === "CURRENT") return "Ativo";
    if (state === "OUTDATED") return "Renovação necessária";
    if (state === "REVOKED") return "Revogado";
    return "Não concedido";
}
