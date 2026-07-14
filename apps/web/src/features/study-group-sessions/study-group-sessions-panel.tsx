/** Adapters de sessões que preservam o contrato visual antigo dos grupos. */
import { StudySessionsPanel } from "../study-sessions/StudySessionsPanel.js";
import {
    createStudyGroupSession,
    listStudyGroupSessions,
} from "./create-study-group-session.js";

type StudyGroupSessionsPanelProps = {
    initialGroupId?: string | null;
    contextLocked?: boolean;
};

export function StudyGroupSessionsPanel({
    initialGroupId,
    contextLocked = false,
}: StudyGroupSessionsPanelProps) {
    return (
        <StudySessionsPanel
            contextLabel="grupo"
            contextLocked={contextLocked}
            createSession={createStudyGroupSession}
            initialContextId={initialGroupId}
            listSessions={listStudyGroupSessions}
        />
    );
}
