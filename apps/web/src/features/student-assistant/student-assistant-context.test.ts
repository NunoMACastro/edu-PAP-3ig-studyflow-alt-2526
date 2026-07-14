import { describe, expect, it } from "vitest";
import { resolveStudentAssistantRouteContext } from "./student-assistant-context.js";

describe("resolveStudentAssistantRouteContext", () => {
    it.each([
        ["/app/disciplinas/subject-id/materiais", "SUBJECT", "subject-id"],
        ["/app/areas/area-id/ferramentas", "STUDY_AREA", "area-id"],
        ["/app/grupos/group-id/mensagens", "STUDY_GROUP", "group-id"],
        ["/app/salas/room-id", "STUDY_ROOM", "room-id"],
        ["/app/turmas/class-id/salas-guiadas/guided-id", "GUIDED_ROOM", "guided-id"],
    ])("resolve %s", (pathname, kind, id) => {
        expect(resolveStudentAssistantRouteContext(pathname)).toEqual({ kind, id });
    });

    it("mantém páginas neutras sem contexto", () => {
        expect(resolveStudentAssistantRouteContext("/app/hoje")).toBeNull();
    });
});
