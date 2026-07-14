/**
 * Testa parsing e sinalização global do cliente HTTP canónico.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    addClassStudent,
    ApiError,
    changeSubjectStatus,
    changeTeacherClassStatus,
    createSubject,
    createTeacherClass,
    getProfile,
    getStudentGuidedStudyRoom,
    listAllStudentGuidedStudyRooms,
    listApprovedAiContent,
    listApprovedAiQuizAttempts,
    removeClassStudent,
    requestJson,
    SESSION_UNAUTHORIZED_EVENT,
    updateSubject,
    updateTeacherClass,
    uploadOfficialMaterialFile,
} from "./apiClient.js";

describe("requestJson", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("preserva status, code e mensagens de validação", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response(
                    JSON.stringify({
                        code: "VALIDATION_FAILED",
                        message: ["Título inválido.", "Pergunta em falta."],
                    }),
                    { status: 400 },
                ),
            ),
        );

        await expect(requestJson("/api/test")).rejects.toEqual(
            expect.objectContaining({
                status: 400,
                code: "VALIDATION_FAILED",
                message: "Título inválido. Pergunta em falta.",
            }),
        );
    });

    it("aceita respostas vazias e sinaliza 401 à sessão", async () => {
        const unauthorized = vi.fn();
        window.addEventListener(SESSION_UNAUTHORIZED_EVENT, unauthorized);
        vi.stubGlobal(
            "fetch",
            vi.fn()
                .mockResolvedValueOnce(new Response(null, { status: 204 }))
                .mockResolvedValueOnce(
                    new Response(
                        JSON.stringify({ code: "UNAUTHENTICATED", message: "Sessão expirada." }),
                        { status: 401 },
                    ),
                ),
        );

        await expect(requestJson<void>("/api/no-content")).resolves.toBeUndefined();
        await expect(requestJson("/api/protected")).rejects.toBeInstanceOf(ApiError);
        expect(unauthorized).toHaveBeenCalledTimes(1);
        window.removeEventListener(SESSION_UNAUTHORIZED_EVENT, unauthorized);
    });

    it("normaliza uma resposta vazia do perfil para o contrato null", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
        );

        await expect(getProfile()).resolves.toBeNull();
    });

    it("preserva o boundary multipart e normaliza erros de upload", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({ code: "UPLOAD_LIMIT", message: "Limite atingido." }),
                { status: 429 },
            ),
        );
        vi.stubGlobal("fetch", fetchMock);
        const body = new FormData();
        body.append("file", new Blob(["x"]), "material.txt");

        await expect(
            requestJson("/api/upload", { method: "POST", body }),
        ).rejects.toEqual(
            expect.objectContaining({ status: 429, code: "UPLOAD_LIMIT" }),
        );
        const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
        expect(headers.has("content-type")).toBe(false);
        expect(headers.get("x-studyflow-csrf")).toBe("1");
    });

    it("submete material oficial com title e file no FormData", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    _id: "material-id",
                    subjectId: "subject-id",
                    classId: "class-id",
                    teacherId: "teacher-id",
                    title: "Manual",
                    type: "PDF",
                    status: "PENDING_PROCESSING",
                    availableToAi: false,
                }),
                { status: 200 },
            ),
        );
        vi.stubGlobal("fetch", fetchMock);
        const file = new File(["%PDF"], "manual.pdf", {
            type: "application/pdf",
        });

        await uploadOfficialMaterialFile("subject-id", {
            title: "Manual",
            file,
        });

        const options = fetchMock.mock.calls[0]?.[1] as RequestInit;
        expect(fetchMock.mock.calls[0]?.[0]).toBe(
            "/api/teacher/subjects/subject-id/materials/file",
        );
        expect(options.body).toBeInstanceOf(FormData);
        expect((options.body as FormData).get("title")).toBe("Manual");
        expect((options.body as FormData).get("file")).toBe(file);
        expect((options.headers as Headers).has("content-type")).toBe(false);
    });

    it("valida e minimiza o histórico persistido de quizzes aprovados", async () => {
        const validAttempt = {
            attemptId: "attempt-id",
            reviewId: "review-id",
            attemptNumber: 2,
            selectedOptionIndexes: [1],
            correctCount: 1,
            totalQuestions: 1,
            scorePercent: 100,
            answeredAt: "2026-07-11T11:00:00.000Z",
        };
        vi.stubGlobal(
            "fetch",
            vi.fn()
                .mockResolvedValueOnce(new Response(JSON.stringify([validAttempt]), { status: 200 }))
                .mockResolvedValueOnce(new Response(JSON.stringify([{ ...validAttempt, results: [] }]), { status: 200 })),
        );

        await expect(
            listApprovedAiQuizAttempts("subject-id", "review-id"),
        ).resolves.toEqual([validAttempt]);
        await expect(
            listApprovedAiQuizAttempts("subject-id", "review-id"),
        ).rejects.toEqual(
            expect.objectContaining({ code: "API_RESPONSE_INVALID", status: 502 }),
        );
    });

    it("envia classId na paginação global e rejeita teacherId no contrato discente", async () => {
        const safeRoom = {
            _id: "room-id",
            classId: "class-id",
            className: "12.º A",
            title: "Revisão",
            description: "Preparação",
            materialIds: [],
            aiEnabled: false,
            status: "OPEN",
            myParticipation: null,
        };
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(new Response(JSON.stringify({ items: [safeRoom], nextCursor: null }), { status: 200 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ ...safeRoom, teacherId: "teacher-id" }], nextCursor: null }), { status: 200 }))
            .mockResolvedValueOnce(new Response(JSON.stringify({
                ...safeRoom,
                teacherId: "teacher-id",
                materials: [],
                invalidMaterialIds: [],
                aiAvailable: false,
            }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(listAllStudentGuidedStudyRooms({ classId: "class-id", limit: 24 }))
            .resolves.toEqual({ items: [safeRoom], nextCursor: null });
        expect(fetchMock.mock.calls[0]?.[0]).toBe(
            "/api/student/guided-study-rooms?status=OPEN&limit=24&classId=class-id",
        );
        await expect(listAllStudentGuidedStudyRooms()).rejects.toEqual(
            expect.objectContaining({ code: "API_RESPONSE_INVALID", status: 502 }),
        );
        await expect(getStudentGuidedStudyRoom("class-id", "room-id")).rejects.toEqual(
            expect.objectContaining({ code: "API_RESPONSE_INVALID", status: 502 }),
        );
    });

    it("rejeita detalhe de sala com campos base ou detail inválidos", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                new Response(JSON.stringify({
                    _id: "room-id",
                    classId: "class-id",
                    title: "Revisão",
                    description: "Preparação",
                    materialIds: [],
                    aiEnabled: false,
                    status: "OPEN",
                    materials: [],
                    invalidMaterialIds: "material-id",
                    aiAvailable: false,
                    myParticipation: null,
                }), { status: 200 }),
            ),
        );

        await expect(getStudentGuidedStudyRoom("class-id", "room-id")).rejects.toEqual(
            expect.objectContaining({ code: "API_RESPONSE_INVALID", status: 502 }),
        );
    });

    it("rejeita payloads inválidos nos novos fluxos docentes de lifecycle", async () => {
        const fetchMock = vi.fn().mockImplementation(() =>
            Promise.resolve(new Response(JSON.stringify({ _id: 42 }), { status: 200 })),
        );
        vi.stubGlobal("fetch", fetchMock);
        const lifecycleRequests = [
            () => createTeacherClass({ name: "12.º A", code: "12A", schoolYear: "2025/2026" }),
            () => addClassStudent("class-id", "aluno@example.test"),
            () => removeClassStudent("class-id", "student-id"),
            () => updateTeacherClass("class-id", { name: "12.º B" }),
            () => changeTeacherClassStatus("class-id", "ARCHIVED"),
            () => createSubject("class-id", { name: "Matemática", code: "MAT" }),
            () => updateSubject("class-id", "subject-id", { name: "Matemática A" }),
            () => changeSubjectStatus("class-id", "subject-id", "ARCHIVED"),
        ];

        for (const request of lifecycleRequests) {
            await expect(request()).rejects.toEqual(
                expect.objectContaining({ code: "API_RESPONSE_INVALID", status: 502 }),
            );
        }
        expect(fetchMock).toHaveBeenCalledTimes(lifecycleRequests.length);
    });

    it("valida e projeta resumos e quizzes aprovados sem campos docentes", async () => {
        const summary = {
            reviewId: "summary-id",
            subjectId: "subject-id",
            material: { id: "material-id", title: "Funções" },
            contentType: "SUMMARY",
            approvedAt: "2026-07-11T10:00:00.000Z",
            origin: "TEACHER_AUTHORED",
            canAttempt: true,
            content: { title: "Resumo", text: "Conteúdo aprovado", bullets: ["Ponto"] },
        };
        const quiz = {
            reviewId: "quiz-id",
            subjectId: "subject-id",
            material: { id: "material-id", title: "Funções" },
            contentType: "QUIZ",
            approvedAt: "2026-07-11T10:00:00.000Z",
            origin: "TEACHER_AUTHORED",
            canAttempt: true,
            content: {
                title: "Quiz",
                questions: [{ questionIndex: 0, question: "Pergunta?", options: ["A", "B"] }],
            },
        };
        vi.stubGlobal(
            "fetch",
            vi.fn()
                .mockResolvedValueOnce(new Response(JSON.stringify([summary, quiz]), { status: 200 }))
                .mockResolvedValueOnce(new Response(JSON.stringify([{ ...summary, teacherComment: "interno" }]), { status: 200 }))
                .mockResolvedValueOnce(new Response(JSON.stringify([{
                    ...quiz,
                    content: {
                        ...quiz.content,
                        questions: [{
                            ...quiz.content.questions[0],
                            correctOptionIndex: 1,
                        }],
                    },
                }]), { status: 200 })),
        );

        await expect(listApprovedAiContent("subject-id")).resolves.toEqual([summary, quiz]);
        await expect(listApprovedAiContent("subject-id")).rejects.toEqual(
            expect.objectContaining({ code: "API_RESPONSE_INVALID", status: 502 }),
        );
        await expect(listApprovedAiContent("subject-id")).rejects.toEqual(
            expect.objectContaining({ code: "API_RESPONSE_INVALID", status: 502 }),
        );
    });
});
