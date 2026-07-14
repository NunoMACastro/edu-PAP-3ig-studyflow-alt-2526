/** Resolve apenas tipo e ID da rota; labels e acesso pertencem ao backend. */
import type { StudentAssistantContextKind } from "../../lib/apiClient.js";

export type StudentAssistantRouteContext = {
    kind: StudentAssistantContextKind;
    id: string;
};

export function resolveStudentAssistantRouteContext(
    pathname: string,
): StudentAssistantRouteContext | null {
    const guided = pathname.match(/^\/app\/turmas\/[^/]+\/salas-guiadas\/([^/]+)/)?.[1];
    if (guided) return { kind: "GUIDED_ROOM", id: guided };
    const subject = pathname.match(/^\/app\/disciplinas\/([^/]+)/)?.[1];
    if (subject) return { kind: "SUBJECT", id: subject };
    const area = pathname.match(/^\/app\/areas\/([^/]+)/)?.[1];
    if (area) return { kind: "STUDY_AREA", id: area };
    const group = pathname.match(/^\/app\/grupos\/([^/]+)/)?.[1];
    if (group) return { kind: "STUDY_GROUP", id: group };
    const room = pathname.match(/^\/app\/salas\/([^/]+)/)?.[1];
    if (room) return { kind: "STUDY_ROOM", id: room };
    return null;
}
