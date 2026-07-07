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
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900">Comunidade e guardrails</h1>
            </header>
            <div className="grid gap-6 xl:grid-cols-2">
                <StudyAlertsPanel />
                <NotificationPreferencesPanel />
                <StudyGroupsPanel />
                <StudyGroupMessagesPanel initialGroupId={selectedGroupId} />
                <StudyGroupSessionsPanel initialGroupId={selectedGroupId} />
                <StudyGroupAiPanel initialGroupId={selectedGroupId} />
                <AiGuardrailsPanel />
                <SourceGroundedAiPanel />
                <ExternalKnowledgeAiPanel />
                <AdaptiveExplanationPanel />
                <UnifiedSearchPanel />
                <CurriculumNavigationPanel />
            </div>
        </div>
    );
}
