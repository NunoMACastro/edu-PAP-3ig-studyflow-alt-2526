/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { AdaptiveExplanationPanel } from "../../features/adaptive-explanations/adaptive-explanation-panel.js";
import { AiGuardrailsPanel } from "../../features/ai-guardrails/ai-guardrails-panel.js";
import { CurriculumNavigationPanel } from "../../features/curriculum-navigation/curriculum-navigation-panel.js";
import { ExternalKnowledgeAiPanel } from "../../features/external-knowledge-ai/external-knowledge-ai-panel.js";
import { NotificationPreferencesPanel } from "../../features/notification-preferences/notification-preferences-panel.js";
import { SourceGroundedAiPanel } from "../../features/source-grounded-ai/source-grounded-ai-panel.js";
import { StudyAlertsPanel } from "../../features/study-alerts/study-alerts-panel.js";
import { StudyGroupAiPanel } from "../../features/study-group-ai/study-group-ai-panel.js";
import { StudyGroupMessagesPanel } from "../../features/study-group-messages/study-group-messages-panel.js";
import { StudyGroupSessionsPanel } from "../../features/study-group-sessions/study-group-sessions-panel.js";
import { StudyGroupsPanel } from "../../features/study-groups/study-groups-panel.js";
import { UnifiedSearchPanel } from "../../features/unified-search/unified-search-panel.js";
import { PageHeader } from "../../components/PageHeader.js";
import { SectionHeader } from "../../components/ui/CalmUi.js";

/**
 * Página agregadora dos fluxos MF3.
 *
 * @returns Painéis de comunidade, guardrails, pesquisa e notificações.
 */
export function Mf3CommunityPage() {
    const selectedGroupId = new URLSearchParams(window.location.search)
        .get("grupo")
        ?.trim();

    return (
        <div className="space-y-8">
            <PageHeader
                description="Grupos, colaboração, pesquisa e controlos de utilização responsável da IA."
                title="Comunidade e guardrails"
            />

            <section className="space-y-5" id="comunidade">
                <SectionHeader
                    description="Organiza grupos, mensagens e sessões coletivas no mesmo contexto."
                    eyebrow="Colaboração"
                    title="Comunidade"
                />
                <div className="grid gap-4 xl:grid-cols-2">
                <StudyGroupsPanel />
                <StudyGroupMessagesPanel initialGroupId={selectedGroupId} />
                <StudyGroupSessionsPanel initialGroupId={selectedGroupId} />
                </div>
            </section>

            <section className="space-y-5" id="ia-colaborativa">
                <SectionHeader
                    description="Ferramentas de IA com fontes, limites e explicações visíveis."
                    eyebrow="IA responsável"
                    title="IA colaborativa e segurança"
                />
                <div className="grid gap-4 xl:grid-cols-2">
                <StudyGroupAiPanel initialGroupId={selectedGroupId} />
                <AiGuardrailsPanel />
                <SourceGroundedAiPanel />
                <ExternalKnowledgeAiPanel />
                <AdaptiveExplanationPanel />
                </div>
            </section>

            <section className="space-y-5" id="descoberta">
                <SectionHeader
                    description="Encontra conteúdo, navega no currículo e consulta alertas de estudo."
                    eyebrow="Descoberta"
                    title="Pesquisa e orientação"
                />
                <div className="grid gap-4 xl:grid-cols-2">
                <UnifiedSearchPanel />
                <CurriculumNavigationPanel />
                    <StudyAlertsPanel />
                </div>
            </section>

            <section className="space-y-5" id="preferencias">
                <SectionHeader
                    description="Controla como recebes notificações relacionadas com a atividade."
                    eyebrow="Preferências"
                    title="Preferências de notificações"
                />
                <div className="max-w-3xl">
                    <NotificationPreferencesPanel />
                </div>
            </section>
        </div>
    );
}
