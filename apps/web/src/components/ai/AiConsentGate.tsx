/**
 * Gate reutilizável para finalidades IA cuja versão de consentimento é decidida
 * pelo backend. Nunca compara versões hard-coded no bundle do aluno.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { InlineNotice } from "../ui/CalmUi.js";
import {
    type AiConsentCapability,
    grantAiConsent,
    listAiConsentCapabilities,
} from "../../features/mf4/mf4-client.js";

type AiConsentGateProps = {
    purpose: string;
    children: ReactNode;
    description: string;
    disabled?: boolean;
};

/** Protege uma superfície IA e permite conceder ou renovar apenas a finalidade necessária. */
export function AiConsentGate({
    purpose,
    children,
    description,
    disabled = false,
}: AiConsentGateProps) {
    const [capability, setCapability] = useState<AiConsentCapability | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async (): Promise<void> => {
        setError(null);
        const capabilities = await listAiConsentCapabilities();
        const nextCapability = capabilities.find((item) => item.purpose === purpose);
        if (!nextCapability) {
            throw new Error("Esta finalidade de IA não está configurada.");
        }
        setCapability(nextCapability);
    }, [purpose]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        refresh()
            .catch((caught) => {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível validar o consentimento.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [refresh]);

    async function allow(): Promise<void> {
        setSaving(true);
        setError(null);
        try {
            await grantAiConsent(purpose);
            await refresh();
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : "Não foi possível registar o consentimento.",
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <InlineNotice>A validar consentimento IA...</InlineNotice>;
    if (error && !capability) return <InlineNotice tone="danger">{error}</InlineNotice>;
    if (disabled) return <>{children}</>;
    if (capability?.canUse) return <>{children}</>;

    const renewal = capability?.state === "OUTDATED";
    return (
        <div className="sf-surface-subtle space-y-3">
            <InlineNotice tone="attention">
                {renewal
                    ? "O consentimento desta funcionalidade precisa de ser renovado antes de continuares."
                    : description}
            </InlineNotice>
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <button
                className="sf-button-primary"
                disabled={saving}
                onClick={() => void allow()}
                type="button"
            >
                {saving
                    ? "A registar..."
                    : renewal
                      ? "Rever e renovar consentimento"
                      : "Aceitar e ativar IA"}
            </button>
        </div>
    );
}
