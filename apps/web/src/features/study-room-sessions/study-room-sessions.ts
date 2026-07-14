/** Cliente das sessões colaborativas de uma sala de estudo. */
import { requestMf3Json } from "../mf3/request-mf3-json.js";
import type { StudySessionView } from "../study-sessions/StudySessionsPanel.js";

export type StudyRoomSession = StudySessionView & {
    roomId: string;
    createdByStudentId: string;
    collaborationKind: "STUDY_ROOM";
    createdAt?: string;
};

export function listStudyRoomSessions(roomId: string): Promise<StudyRoomSession[]> {
    return requestMf3Json<StudyRoomSession[]>(`/api/study-rooms/${roomId}/sessions`);
}

export function createStudyRoomSession(
    roomId: string,
    input: {
        title: string;
        startsAt: string;
        durationMinutes: number;
        goal?: string;
    },
): Promise<StudyRoomSession> {
    return requestMf3Json<StudyRoomSession>(`/api/study-rooms/${roomId}/sessions`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}
