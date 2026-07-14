/** Adapter das sessões para uma sala cujo contexto já está fixo pela rota. */
import { StudySessionsPanel } from "../study-sessions/StudySessionsPanel.js";
import {
    createStudyRoomSession,
    listStudyRoomSessions,
} from "./study-room-sessions.js";

export function StudyRoomSessionsPanel({ roomId }: { roomId: string }) {
    return (
        <StudySessionsPanel
            contextLabel="sala"
            contextLocked
            createSession={createStudyRoomSession}
            initialContextId={roomId}
            listSessions={listStudyRoomSessions}
        />
    );
}
