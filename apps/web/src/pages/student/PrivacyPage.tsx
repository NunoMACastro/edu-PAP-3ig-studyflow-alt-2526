/**
 * Renderiza a página MF4 de privacidade do utilizador autenticado.
 */
import { PageHeader } from "../../components/PageHeader.js";
import { PrivacyPanel } from "../../features/mf4/privacy-panel.js";

/**
 * Página de privacidade, exportação, eliminação e consentimentos.
 *
 * @returns Página de privacidade.
 */
export function PrivacyPage() {
    return (
        <section className="space-y-6">
            <PageHeader description="Gere exportações, consentimentos de IA e operações sensíveis da tua conta." title="Privacidade" />
            <PrivacyPanel />
        </section>
    );
}
