/**
 * Testes comportamentais dos painéis de governança, acompanhamento e
 * privacidade. Usam contratos autorizados e não incluem dados pessoais reais.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
    listTeacherClasses: vi.fn(),
}));

const clientMocks = vi.hoisted(() => ({
    changeUserRole: vi.fn(),
    createContextNotification: vi.fn(),
    createFollowUpRule: vi.fn(),
    deleteAccount: vi.fn(),
    downloadDataExport: vi.fn(),
    getFollowUpAlertsSummary: vi.fn(),
    getFollowUpStudentOverview: vi.fn(),
    grantAiConsent: vi.fn(),
    listAdminUsers: vi.fn(),
    listAiConsents: vi.fn(),
    listAiConsentCapabilities: vi.fn(),
    listAiModelPolicies: vi.fn(),
    listAiQuotas: vi.fn(),
    listAiUsage: vi.fn(),
    listAuditEvents: vi.fn(),
    listContextNotifications: vi.fn(),
    listDataExports: vi.fn(),
    listFollowUpStudentOfficialTests: vi.fn(),
    listNotificationPolicies: vi.fn(),
    notifyFollowUpStudent: vi.fn(),
    requestDataExport: vi.fn(),
    revokeAiConsent: vi.fn(),
    runFollowUpRule: vi.fn(),
    saveAiModelPolicy: vi.fn(),
    saveAiQuotaPolicy: vi.fn(),
    saveNotificationPolicy: vi.fn(),
}));

vi.mock("../../lib/apiClient.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../../lib/apiClient.js")>()),
    listTeacherClasses: apiMocks.listTeacherClasses,
}));

vi.mock("./mf4-client.js", () => clientMocks);

import { AdminGovernancePanel } from "./admin-governance-panel.js";
import { FollowUpAlertsPanel } from "./follow-up-alerts-panel.js";
import { PrivacyPanel } from "./privacy-panel.js";

const schoolClass = {
    _id: "class-id",
    teacherId: "teacher-id",
    name: "Turma A",
    code: "TA",
    schoolYear: "2025/2026",
    studentIds: ["student-id"],
    students: [{ id: "student-id", email: "aluno@example.test" }],
};

const notificationPolicy = {
    channel: "IN_APP" as const,
    enabled: true,
    maxPerUserPerDay: 5,
    maxPerContextPerHour: 10,
};

const modelPolicy = {
    purpose: "PRIVATE_AREA_AI",
    enabled: true,
    provider: "openai",
    model: "gpt-test",
    timeoutMs: 8000,
    maxSourceCount: 10,
    maxPromptChars: 12000,
};

const quotaPolicy = {
    _id: "quota-id",
    scope: "USER" as const,
    targetId: "student-id",
    purpose: "PRIVATE_AREA_AI",
    monthlyLimitUnits: 100,
};

const followUpTests = [
    {
        testId: "test-published",
        subjectId: "subject-id",
        subjectName: "Matemática",
        title: "Funções",
        status: "PUBLISHED" as const,
        bestAttempt: {
            correctAnswers: 8,
            totalQuestions: 10,
            percentage: 80,
            attemptCount: 2,
            answeredAt: "2026-07-10T12:00:00.000Z",
        },
    },
    {
        testId: "test-closed",
        subjectId: "subject-id",
        subjectName: "Matemática",
        title: "Equações",
        status: "CLOSED" as const,
        bestAttempt: null,
    },
];

beforeEach(() => {
    for (const mock of [...Object.values(apiMocks), ...Object.values(clientMocks)]) {
        mock.mockReset();
    }

    apiMocks.listTeacherClasses.mockResolvedValue([schoolClass]);
    clientMocks.listAdminUsers.mockResolvedValue([
        { id: "student-id", email: "aluno@example.test", role: "STUDENT", authProvider: "local" },
    ]);
    clientMocks.listAuditEvents.mockResolvedValue([
        { id: "event-id", actorId: "admin-id", domain: "AUTH", action: "ROLE_CHANGED", resourceType: "User", result: "SUCCESS" },
    ]);
    clientMocks.listNotificationPolicies.mockResolvedValue([notificationPolicy]);
    clientMocks.listAiModelPolicies.mockResolvedValue([modelPolicy]);
    clientMocks.listAiQuotas.mockResolvedValue([quotaPolicy]);
    clientMocks.listAiUsage.mockResolvedValue([
        { _id: "usage-id", scope: "USER", targetId: "student-id", purpose: "PRIVATE_AREA_AI", period: "2026-07", usedUnits: 3 },
    ]);
    clientMocks.changeUserRole.mockResolvedValue({ ok: true });
    clientMocks.saveNotificationPolicy.mockResolvedValue(notificationPolicy);
    clientMocks.saveAiModelPolicy.mockResolvedValue(modelPolicy);
    clientMocks.saveAiQuotaPolicy.mockResolvedValue(quotaPolicy);

    clientMocks.getFollowUpAlertsSummary.mockResolvedValue({
        rules: [
            {
                id: "rule-id",
                classId: "class-id",
                className: "Turma A",
                inactiveDays: 7,
                title: "Acompanhamento",
                message: "Mensagem segura",
                inactiveStudentsCount: 1,
                inactiveStudents: [{ studentId: "student-id", displayName: "Aluno 001" }],
            },
        ],
    });
    clientMocks.listContextNotifications.mockResolvedValue([
        { id: "notification-id", contextType: "CLASS", contextId: "class-id", type: "TASK", title: "Tarefa", body: "Consulta a tarefa", recipientCount: 1, suppressedRecipientCount: 0 },
    ]);
    clientMocks.createFollowUpRule.mockResolvedValue({ id: "new-rule", classId: "class-id", inactiveDays: 7, title: "Acompanhamento", message: "Mensagem" });
    clientMocks.createContextNotification.mockResolvedValue({ id: "new-notification" });
    clientMocks.runFollowUpRule.mockResolvedValue({
        rule: { id: "rule-id" },
        inactiveStudentIds: ["student-id"],
        notification: { id: "notification-id" },
    });
    clientMocks.listFollowUpStudentOfficialTests.mockResolvedValue(followUpTests);
    clientMocks.getFollowUpStudentOverview.mockResolvedValue({
        class: { id: "class-id", name: "Turma A", schoolYear: "2025/2026" },
        student: { id: "student-id", displayName: "aluno@example.test", email: "aluno@example.test" },
        activity: {
            joinedAt: "2026-06-01T10:00:00.000Z",
            firstActivityAt: "2026-06-02T10:00:00.000Z",
            lastActivityAt: "2026-07-10T10:00:00.000Z",
            lastActivityType: "OFFICIAL_TEST_ATTEMPT",
            activityCount: 8,
            current30DaysCount: 5,
            previous30DaysCount: 3,
            trend: "MORE",
            byType: { OFFICIAL_TEST_ATTEMPT: 2 },
            recent: [],
        },
        guidedRooms: {
            totalRooms: 2,
            viewedRooms: 2,
            completedRooms: 1,
            completionPercent: 50,
            lastViewedAt: "2026-07-09T10:00:00.000Z",
        },
        officialTests: {
            items: followUpTests,
            totalTests: 2,
            attemptedTests: 1,
            averageBestPercentage: 80,
        },
        approvedAiQuizzes: {
            attemptCount: 2,
            quizCount: 1,
            averageScorePercent: 75,
            bestScorePercent: 100,
            lastAnsweredAt: "2026-07-10T11:00:00.000Z",
        },
        factualSignals: [
            {
                code: "GUIDED_ROOMS_NOT_COMPLETED",
                label: "Salas guiadas por concluir",
                evidence: "1 de 2 salas concluídas.",
            },
        ],
    });
    clientMocks.notifyFollowUpStudent.mockResolvedValue({
        id: "student-notification",
        contextType: "CLASS",
        contextId: "class-id",
        type: "FOLLOW_UP",
        title: "Acompanhamento de estudo",
        body: "Há alunos sem atividade recente.",
        recipientCount: 1,
        suppressedRecipientCount: 0,
    });

    clientMocks.listDataExports.mockResolvedValue([
        { id: "export-ready", status: "READY", expiresAt: "2026-08-01T00:00:00.000Z" },
        { id: "export-expired", status: "EXPIRED", expiresAt: "2026-06-01T00:00:00.000Z" },
    ]);
    clientMocks.listAiConsents.mockResolvedValue([
        { id: "consent-id", purpose: "PRIVATE_AREA_AI", status: "GRANTED", policyVersion: "2026-07" },
    ]);
    clientMocks.listAiConsentCapabilities.mockResolvedValue([
        { purpose: "PRIVATE_AREA_AI", requiredVersion: "current", state: "CURRENT", canUse: true },
        { purpose: "ROOM_AI", requiredVersion: "current", state: "MISSING", canUse: false },
    ]);
    clientMocks.requestDataExport.mockResolvedValue({ id: "new-export" });
    clientMocks.downloadDataExport.mockResolvedValue({ schemaVersion: 1, categories: {} });
    clientMocks.grantAiConsent.mockResolvedValue({ id: "grant-id" });
    clientMocks.revokeAiConsent.mockResolvedValue({ id: "revoke-id" });
});

describe("AdminGovernancePanel", () => {
    it("carrega dados e executa as três operações administrativas", async () => {
        const user = userEvent.setup();
        render(<AdminGovernancePanel />);

        expect(await screen.findByText("aluno@example.test")).toBeTruthy();
        expect(screen.getByText("ROLE_CHANGED")).toBeTruthy();
        expect(screen.getByText(/2026-07.*3/)).toBeTruthy();

        await user.selectOptions(screen.getAllByRole("combobox")[0], "ADMIN");
        await waitFor(() => expect(clientMocks.changeUserRole).toHaveBeenCalledWith("student-id", "ADMIN"));

        await user.click(within(screen.getByRole("heading", { name: "Canais" }).parentElement!).getByRole("button", { name: "Guardar" }));
        await waitFor(() => expect(clientMocks.saveNotificationPolicy).toHaveBeenCalled());

        await user.click(screen.getAllByRole("button", { name: "Guardar modelo" })[0]);
        await waitFor(() => expect(clientMocks.saveAiModelPolicy).toHaveBeenCalled());

        await user.click(screen.getByRole("button", { name: "Guardar quota" }));
        await waitFor(() => expect(clientMocks.saveAiQuotaPolicy).toHaveBeenCalled());
        expect(screen.getByText("Quota IA guardada.")).toBeTruthy();
    });

    it("mostra falha controlada quando a carga inicial falha", async () => {
        clientMocks.listAdminUsers.mockRejectedValueOnce(new Error("Serviço indisponível"));
        render(<AdminGovernancePanel />);
        expect(await screen.findByText("Serviço indisponível")).toBeTruthy();
    });
});

describe("FollowUpAlertsPanel", () => {
    it("cria, notifica e executa regras com contagens minimizadas", async () => {
        const user = userEvent.setup();
        render(<FollowUpAlertsPanel />);

        expect(await screen.findByText("aluno@example.test")).toBeTruthy();
        expect(screen.getByText("Aluno 001")).toBeTruthy();
        expect(screen.getByText("1 aluno")).toBeTruthy();

        fireEvent.submit(screen.getByRole("button", { name: "Criar regra" }).closest("form")!);
        await waitFor(() => expect(clientMocks.createFollowUpRule).toHaveBeenCalledWith(expect.objectContaining({ classId: "class-id", inactiveDays: 7 })));

        await user.click(screen.getByRole("button", { name: "Notificar turma" }));
        await waitFor(() => expect(clientMocks.createContextNotification).toHaveBeenCalledWith(expect.objectContaining({ contextType: "CLASS", type: "TASK" })));

        await user.click(screen.getByRole("button", { name: "Executar regra" }));
        await waitFor(() => expect(clientMocks.runFollowUpRule).toHaveBeenCalledWith("rule-id"));
        expect(await screen.findByText(/1 aluno notificado/)).toBeTruthy();
    });

    it("mostra todos os alunos, filtra alertas e abre detalhe BEST_ATTEMPT", async () => {
        const user = userEvent.setup();
        apiMocks.listTeacherClasses.mockResolvedValueOnce([
            {
                ...schoolClass,
                studentIds: ["student-id", "active-student"],
                students: [
                    { id: "student-id", email: "aluno@example.test" },
                    { id: "active-student", email: "ativo@example.test" },
                ],
            },
        ]);
        render(<FollowUpAlertsPanel />);

        expect(await screen.findByText("ativo@example.test")).toBeTruthy();
        await user.selectOptions(screen.getByLabelText("Alertas"), "INACTIVE");
        expect(screen.getByText("aluno@example.test")).toBeTruthy();
        expect(screen.queryByText("ativo@example.test")).toBeNull();

        await user.click(screen.getByRole("button", { name: "Ver detalhe" }));
        await waitFor(() =>
            expect(clientMocks.getFollowUpStudentOverview).toHaveBeenCalledWith(
                "class-id",
                "student-id",
            ),
        );
        expect(await screen.findByText("Salas guiadas por concluir")).toBeTruthy();
        expect(screen.getByText(/2 tentativas em 1 quizzes/)).toBeTruthy();
        expect(await screen.findByText(/Melhor tentativa: 80%/)).toBeTruthy();
        expect(screen.getByText("Sem tentativa.")).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Notificar aluno" }));
        await waitFor(() =>
            expect(clientMocks.notifyFollowUpStudent).toHaveBeenCalledWith(
                "class-id",
                "student-id",
                expect.objectContaining({ title: "Acompanhamento de estudo" }),
            ),
        );
        expect(await screen.findByText("Notificação enviada ao aluno.")).toBeTruthy();
    });

    it("distingue notificação individual suprimida pelas preferências", async () => {
        const user = userEvent.setup();
        clientMocks.notifyFollowUpStudent.mockResolvedValueOnce({
            id: "suppressed",
            recipientCount: 0,
            suppressedRecipientCount: 1,
        });
        render(<FollowUpAlertsPanel />);

        await user.click(await screen.findByRole("button", { name: "Ver detalhe" }));
        await user.click(screen.getByRole("button", { name: "Notificar aluno" }));
        expect(
            await screen.findByText(
                "Notificação não entregue devido às preferências do aluno.",
            ),
        ).toBeTruthy();
    });

    it("sincroniza turma autorizada no URL e corrige classId inválido", async () => {
        window.history.replaceState(null, "", "/app/professor/acompanhamento?classId=externa");
        render(<FollowUpAlertsPanel />);

        await screen.findByText("aluno@example.test");
        expect(window.location.search).toBe("?classId=class-id");
    });

    it("valida o intervalo dos dias antes de contactar a API", async () => {
        const user = userEvent.setup();
        render(<FollowUpAlertsPanel />);
        const days = await screen.findByLabelText("Dias sem atividade");
        await user.clear(days);
        await user.type(days, "0");
        fireEvent.submit(screen.getByRole("button", { name: "Criar regra" }).closest("form")!);
        expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Define um número de dias entre 1 e 90.");
        expect(clientMocks.createFollowUpRule).not.toHaveBeenCalled();
    });
});

describe("PrivacyPanel", () => {
    it("pede e descarrega exportação e alterna consentimentos", async () => {
        const user = userEvent.setup();
        const createObjectURL = vi.fn().mockReturnValue("blob:export");
        const revokeObjectURL = vi.fn();
        vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

        render(<PrivacyPanel />);
        expect(await screen.findByText(/Pronta/)).toBeTruthy();
        expect(screen.getByText(/Expirada/)).toBeTruthy();

        await user.click(screen.getByRole("button", { name: "Pedir exportação" }));
        await waitFor(() => expect(clientMocks.requestDataExport).toHaveBeenCalledTimes(1));

        await user.click(screen.getAllByRole("button", { name: "Descarregar JSON" })[0]);
        await waitFor(() => expect(clientMocks.downloadDataExport).toHaveBeenCalledWith("export-ready"));
        expect(createObjectURL).toHaveBeenCalled();
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:export");

        await user.click(screen.getByRole("checkbox", { name: "Consentimento: IA da área privada" }));
        await waitFor(() => expect(clientMocks.revokeAiConsent).toHaveBeenCalledWith("PRIVATE_AREA_AI"));

        await user.click(screen.getByRole("checkbox", { name: "Consentimento: IA das salas de estudo" }));
        await waitFor(() => expect(clientMocks.grantAiConsent).toHaveBeenCalledWith("ROOM_AI"));
    });

    it("mantém eliminação desativada até à confirmação exata", async () => {
        const user = userEvent.setup();
        render(<PrivacyPanel />);
        const button = await screen.findByRole("button", { name: "Eliminar conta" }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);
        await user.type(screen.getByLabelText(/Escreve/), "ELIMINAR A MINHA CONTA");
        expect(button.disabled).toBe(false);
    });
});
