import { expect, test, type Page } from "@playwright/test";

type Credentials = {
    email: string;
    password: string;
};

const student = readCredentials("STUDENT", {
    email: "aluno.dev@studyflow.local",
    password: "aluno-dev-12345",
});

const teacher = readCredentials("TEACHER", {
    email: "professor.dev@studyflow.local",
    password: "professor-dev-12345",
});

/**
 * Lê credenciais E2E com fallback para as contas seedadas localmente.
 *
 * @param role Role usado no sufixo das variáveis de ambiente.
 * @param fallback Conta criada pela seed E2E local.
 * @returns Credenciais a usar no login pela UI.
 */
function readCredentials(role: "STUDENT" | "TEACHER", fallback: Credentials): Credentials {
    return {
        email: process.env[`STUDYFLOW_E2E_${role}_EMAIL`] ?? fallback.email,
        password: process.env[`STUDYFLOW_E2E_${role}_PASSWORD`] ?? fallback.password,
    };
}

/**
 * Entra pela UI para validar sessão real baseada em cookies HttpOnly.
 *
 * @param page Página Playwright.
 * @param credentials Credenciais E2E.
 * @returns Promise resolvida quando a shell autenticada aparece.
 */
async function loginAs(page: Page, credentials: Credentials): Promise<void> {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "StudyFlow" })).toBeAttached();
    await expect(page.locator('img[src="/assets/studyflow-logo.svg"]:visible')).toBeVisible();
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

/**
 * Termina a sessão atual antes de validar outro role.
 *
 * @param page Página Playwright.
 * @returns Promise resolvida quando a página de login aparece.
 */
async function logout(page: Page): Promise<void> {
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
}

test("MF5 navegação: links mudam por role e página atual fica marcada", async ({
    page,
}) => {
    await loginAs(page, student);
    await page.goto("/app/areas");

    const studentNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(studentNav.getByRole("link", { name: "Áreas" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await expect(studentNav.getByRole("link", { name: "Dashboard" })).toHaveCount(0);
    await expect(studentNav.getByRole("link", { name: "Acompanhamento" })).toHaveCount(0);
    await expect(studentNav.getByRole("link", { name: "Governança" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Ações de criação" })).toHaveCount(0);

    await logout(page);

    await page.route("**/api/teacher/dashboard", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            json: teacherDashboardFixture(),
        });
    });
    const teacherClassId = "507f1f77bcf86cd799439014";
    const teacherClassStudentId = "507f1f77bcf86cd799439015";
    let removeStudentRequests = 0;
    let createSubjectRequests = 0;
    let teacherClasses = teacherClassesFixture(true);
    let teacherSubjects = teacherSubjectsFixture();
    await page.route("**/api/teacher/classes**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const method = route.request().method();

        if (pathname === `/api/teacher/classes/${teacherClassId}/subjects`) {
            if (method === "GET") {
                await route.fulfill({
                    contentType: "application/json",
                    json: teacherSubjects,
                });
                return;
            }

            if (method === "POST") {
                const input = route.request().postDataJSON() as {
                    name: string;
                    code: string;
                    description?: string;
                };
                const createdSubject = {
                    _id: "507f1f77bcf86cd799439026",
                    classId: teacherClassId,
                    teacherId: "507f1f77bcf86cd799439012",
                    name: input.name,
                    code: input.code,
                    description: input.description ?? "",
                    status: "ACTIVE",
                    createdAt: "2026-03-01T00:00:00.000Z",
                };
                createSubjectRequests += 1;
                teacherSubjects = [createdSubject, ...teacherSubjects];
                await route.fulfill({
                    contentType: "application/json",
                    json: createdSubject,
                });
                return;
            }
        }

        if (method === "GET" && pathname === "/api/teacher/classes") {
            await route.fulfill({
                contentType: "application/json",
                json: teacherClasses,
            });
            return;
        }

        if (
            method === "DELETE" &&
            pathname ===
                `/api/teacher/classes/${teacherClassId}/students/${teacherClassStudentId}`
        ) {
            removeStudentRequests += 1;
            teacherClasses = teacherClassesFixture(false);
            await route.fulfill({
                contentType: "application/json",
                json: teacherClasses[0],
            });
            return;
        }

        await route.continue();
    });
    await loginAs(page, teacher);
    await expect(page).toHaveURL(/\/app\/professor$/);
    await expect(page.getByRole("heading", { name: "Dashboard docente" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Criar turma" })).toBeVisible();
    await page.getByRole("link", { name: "Criar turma" }).click();
    await expect(page).toHaveURL(/\/app\/professor\/turmas#criar-turma$/);
    const createClassForm = page.locator("form#criar-turma");
    await expect(createClassForm).toBeVisible();
    await expect(createClassForm.getByLabel("Nome")).toBeFocused();
    await page.goto("/app/professor");
    await expect(page.getByRole("heading", { name: "Dashboard docente" })).toBeVisible();
    const overviewPanel = page.locator("section").filter({
        has: page.getByRole("heading", { name: "Visão geral" }),
    });
    await expect(overviewPanel.getByText("Regras de acompanhamento", { exact: true })).toBeVisible();
    await expect(overviewPanel.getByRole("link", { name: "Abrir turmas" })).toBeVisible();
    await expect(overviewPanel.getByText("Sinais a rever", { exact: true })).toBeVisible();
    await expect(
        overviewPanel.getByRole("link", { name: "Gerir regras de acompanhamento" }),
    ).toBeVisible();
    await expect(page.getByText("Atividade de acompanhamento", { exact: true })).toBeVisible();
    await expect(page.getByText("Matemática")).toHaveCount(0);
    await page.getByRole("button", { name: "Disciplinas e apoio" }).click();
    await expect(page.getByText("Matemática")).toBeVisible();
    await expect(page.getByText("1 material · 1 mini-teste · 1 sala guiada aberta")).toBeVisible();
    await expect(
        page.getByRole("link", { name: "Materiais de Matemática" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Testes de Matemática" })).toBeVisible();
    await expect(
        page.getByRole("link", { name: "Revisões IA de Matemática" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Chat de Matemática" })).toBeVisible();
    await expect(
        page.getByRole("link", { name: "Salas guiadas de Matemática" }),
    ).toBeVisible();
    await expect(page.getByText("aluno.dev@studyflow.local")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Ações de criação" })).toHaveCount(0);

    const teacherNav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(teacherNav.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard docente" })).toBeVisible();
    await expect(teacherNav.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await teacherNav.getByRole("link", { name: "Turmas" }).click();
    await expect(page).toHaveURL(/\/app\/professor\/turmas$/);
    await expect(page.getByRole("heading", { name: "Turmas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova turma" })).toBeVisible();
    await expect(page.getByLabel("Pesquisar turma")).toBeVisible();
    await expect(page.getByLabel("Ordenar")).toBeVisible();
    await expect(page.getByText("2 turmas ativas")).toBeVisible();

    const classCards = page.locator('section[aria-label="Turmas do professor"] article');
    await expect(classCards.locator("h2")).toHaveText(["12.º Demo", "11.º Alpha"]);
    const demoClassCard = classCards.filter({
        has: page.getByRole("heading", { name: "12.º Demo" }),
    });
    const alphaClassCard = classCards.filter({
        has: page.getByRole("heading", { name: "11.º Alpha" }),
    });

    await expect(
        demoClassCard.getByRole("button", { name: "Voz IA da turma 12.º Demo" }),
    ).toBeVisible();
    await expect(demoClassCard.getByText("Com alunos")).toBeVisible();
    await expect(demoClassCard.getByRole("link", { name: "Gerir disciplinas" })).toBeVisible();
    await expect(demoClassCard.getByRole("link", { name: "Salas guiadas de 12.º Demo" })).toBeVisible();
    await expect(demoClassCard.getByRole("button", { name: "Gerir 1 aluno" })).toHaveAttribute(
        "aria-expanded",
        "false",
    );
    await expect(alphaClassCard.getByText("Sem alunos")).toBeVisible();
    await expect(
        alphaClassCard.getByRole("button", { name: "Adicionar primeiro aluno", exact: true }),
    ).toBeVisible();

    await demoClassCard.getByRole("link", { name: "Gerir disciplinas" }).click();
    await expect(page).toHaveURL(
        new RegExp(`/app/professor/turmas/${teacherClassId}/disciplinas$`),
    );
    await expect(page.getByRole("heading", { level: 1, name: "Disciplinas" })).toBeVisible();
    await expect(
        page.getByRole("main").getByRole("link", { name: "Turmas" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Nova disciplina" })).toBeVisible();
    await expect(page.getByLabel("Pesquisar disciplina")).toBeVisible();
    await expect(page.getByLabel("Ordenar")).toBeVisible();
    await expect(page.getByText("2 disciplinas")).toBeVisible();

    const subjectCards = page.locator('section[aria-label="Disciplinas da turma"] article');
    await expect(subjectCards.locator("h2")).toHaveText(["Matemática", "Programação"]);
    const mathSubjectCard = subjectCards.filter({
        has: page.getByRole("heading", { name: "Matemática" }),
    });
    await expect(
        mathSubjectCard.getByRole("link", { name: "Materiais de Matemática" }),
    ).toBeVisible();
    await expect(mathSubjectCard.getByRole("link", { name: "Chat de Matemática" })).toBeVisible();
    await expect(
        mathSubjectCard.getByRole("link", { name: "Voz IA de Matemática" }),
    ).toBeVisible();
    await expect(
        mathSubjectCard.getByRole("link", { name: "Testes de Matemática" }),
    ).toBeVisible();
    await expect(
        mathSubjectCard.getByRole("link", { name: "Revisões IA de Matemática" }),
    ).toBeVisible();
    await expect(
        mathSubjectCard.getByRole("link", { name: "Fontes da IA de Matemática" }),
    ).toBeVisible();

    await page.getByLabel("Pesquisar disciplina").fill("prog");
    await expect(page.getByText("1 de 2 disciplinas visíveis")).toBeVisible();
    await expect(subjectCards.locator("h2")).toHaveText(["Programação"]);
    await page.getByLabel("Pesquisar disciplina").fill("");
    await expect(page.getByText("2 disciplinas")).toBeVisible();

    await page.goto(`/app/professor/turmas/${teacherClassId}/disciplinas#criar-disciplina`);
    await expect(page.locator("form#criar-disciplina")).toBeVisible();
    const createSubjectForm = page.locator("form#criar-disciplina");
    await expect(createSubjectForm.getByLabel("Nome")).toBeFocused();
    await createSubjectForm.getByLabel("Nome").fill("Física Aplicada");
    await createSubjectForm.getByLabel("Código").fill("FIS-APP");
    await createSubjectForm
        .getByLabel("Descrição")
        .fill("Disciplina criada pelo teste de navegação MF5.");
    await createSubjectForm.getByRole("button", { name: "Criar disciplina" }).click();
    await expect(page.getByText("Disciplina criada.")).toBeVisible();
    await expect(
        page
            .locator('section[aria-label="Disciplinas da turma"] article')
            .filter({ has: page.getByRole("heading", { name: "Física Aplicada" }) }),
    ).toBeVisible();
    await expect(page.getByText("3 disciplinas")).toBeVisible();
    expect(createSubjectRequests).toBe(1);

    await page.goto("/app/professor/turmas");
    await expect(page.getByRole("heading", { name: "Turmas" })).toBeVisible();

    await page.getByLabel("Pesquisar turma").fill("ALFA");
    await expect(page.getByText("1 de 2 turmas visíveis")).toBeVisible();
    await expect(page.getByRole("heading", { name: "11.º Alpha" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "12.º Demo" })).toHaveCount(0);
    await page.getByLabel("Pesquisar turma").fill("sem resultado");
    await expect(page.getByText("Nenhuma turma corresponde à pesquisa.")).toBeVisible();
    await expect(classCards).toHaveCount(0);
    await page.getByLabel("Pesquisar turma").fill("");
    await page.getByLabel("Ordenar").selectOption("name");
    await expect(classCards.locator("h2")).toHaveText(["11.º Alpha", "12.º Demo"]);
    const sortedAlphaClassCard = classCards.filter({
        has: page.getByRole("heading", { name: "11.º Alpha" }),
    });
    await sortedAlphaClassCard
        .getByRole("button", { name: "Adicionar primeiro aluno", exact: true })
        .click();
    await expect(
        sortedAlphaClassCard.getByRole("button", {
            exact: true,
            name: "Adicionar primeiro aluno",
        }),
    ).toHaveAttribute("aria-expanded", "true");

    await expect(page.getByText("aluno.dev@studyflow.local")).toHaveCount(0);
    await page.goto(`/app/professor/turmas#students-${teacherClassId}`);
    await expect(page.getByRole("button", { name: "Gerir 1 aluno" })).toHaveAttribute(
        "aria-expanded",
        "true",
    );
    await expect(page.getByText("aluno.dev@studyflow.local")).toBeVisible();
    page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain("aluno.dev@studyflow.local");
        await dialog.accept();
    });
    await page
        .getByRole("button", {
            name: "Remover aluno.dev@studyflow.local de 12.º Demo",
        })
        .click();
    await expect(page.getByText("Aluno removido da turma.")).toBeVisible();
    await expect(
        page.locator(`#students-panel-${teacherClassId}`).getByText("Ainda não há alunos inscritos."),
    ).toBeVisible();
    expect(removeStudentRequests).toBe(1);
    await expect(teacherNav.getByRole("link", { name: "Turmas" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await expect(teacherNav.getByRole("link", { name: "Estudo" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Ações de criação" })).toHaveCount(0);
});

test("MF5 navegação: acompanhamento docente fica acessível", async ({ page }) => {
    await page.route("**/api/teacher/dashboard", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            json: teacherDashboardFixture(),
        });
    });
    await page.route("**/api/teacher/classes**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const method = route.request().method();

        if (method === "GET" && pathname === "/api/teacher/classes") {
            await route.fulfill({
                contentType: "application/json",
                json: teacherClassesFixture(true),
            });
            return;
        }

        await route.continue();
    });
    await page.route("**/api/follow-up-alerts/summary", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            json: { rules: [] },
        });
    });
    await page.route("**/api/follow-up-centre/classes/**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const method = route.request().method();
        if (method === "GET") {
            await route.fulfill({
                contentType: "application/json",
                json: {
                    class: {
                        id: "507f1f77bcf86cd799439014",
                        name: "12.º Demo",
                        schoolYear: "2025/2026",
                    },
                    student: {
                        id: "507f1f77bcf86cd799439015",
                        displayName: "aluno.dev@studyflow.local",
                        email: "aluno.dev@studyflow.local",
                    },
                    activity: {
                        joinedAt: "2026-02-01T00:00:00.000Z",
                        firstActivityAt: "2026-07-01T12:00:00.000Z",
                        lastActivityAt: "2026-07-10T12:00:00.000Z",
                        lastActivityType: "TEST_ATTEMPT",
                        activityCount: 5,
                        current30DaysCount: 3,
                        previous30DaysCount: 2,
                        trend: "MORE",
                        byType: { TEST_ATTEMPT: 2, GUIDED_ROOM_VIEW: 3 },
                        recent: [],
                    },
                    guidedRooms: {
                        totalRooms: 1,
                        viewedRooms: 1,
                        completedRooms: 1,
                        completionPercent: 100,
                        lastViewedAt: "2026-07-10T11:00:00.000Z",
                    },
                    officialTests: {
                        items: [
                            {
                                testId: "507f1f77bcf86cd799439017",
                                subjectId: "507f1f77bcf86cd799439016",
                                subjectName: "Matemática",
                                title: "Funções",
                                status: "PUBLISHED",
                                bestAttempt: {
                                    correctAnswers: 8,
                                    totalQuestions: 10,
                                    percentage: 80,
                                    attemptCount: 2,
                                    answeredAt: "2026-07-10T12:00:00.000Z",
                                },
                            },
                            {
                                testId: "507f1f77bcf86cd799439018",
                                subjectId: "507f1f77bcf86cd799439016",
                                subjectName: "Matemática",
                                title: "Equações",
                                status: "CLOSED",
                                bestAttempt: null,
                            },
                        ],
                        totalTests: 2,
                        attemptedTests: 1,
                        averageBestPercentage: 80,
                    },
                    approvedAiQuizzes: {
                        attemptCount: 0,
                        quizCount: 0,
                        averageScorePercent: null,
                        bestScorePercent: null,
                        lastAnsweredAt: null,
                    },
                    factualSignals: [],
                },
            });
            return;
        }
        await route.continue();
    });
    await page.route("**/api/follow-up-alerts/classes/**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        const method = route.request().method();
        if (method === "POST" && pathname.endsWith("/notify")) {
            await route.fulfill({
                contentType: "application/json",
                json: {
                    id: "notification-student",
                    contextType: "CLASS",
                    contextId: "507f1f77bcf86cd799439014",
                    type: "FOLLOW_UP",
                    title: "Acompanhamento de estudo",
                    body: "Há alunos sem atividade recente.",
                    recipientCount: 1,
                    suppressedRecipientCount: 0,
                },
            });
            return;
        }
        await route.continue();
    });
    await page.route("**/api/context-notifications/sent", async (route) => {
        await route.fulfill({
            contentType: "application/json",
            json: [],
        });
    });

    await loginAs(page, teacher);

    const teacherNav = page.getByRole("navigation", { name: "Navegação principal" });
    await teacherNav.getByRole("link", { name: "Centro de Acompanhamento" }).click();
    await expect(page).toHaveURL(/\/app\/professor\/acompanhamento\?classId=/);
    await expect(page.getByRole("heading", { name: "Centro de Acompanhamento" })).toBeVisible();
    await expect(page.getByLabel("Turma", { exact: true })).toBeVisible();
    await expect(page.getByText("Dias sem atividade")).toBeVisible();
    await expect(page.getByText("aluno.dev@studyflow.local")).toBeVisible();
    await page.getByRole("button", { name: "Ver detalhe" }).click();
    await expect(page.getByText(/Melhor tentativa: 80%/)).toBeVisible();
    await expect(page.getByText("Sem tentativa.")).toBeVisible();
    await page.getByRole("button", { name: "Notificar aluno" }).click();
    await expect(page.getByText("Notificação enviada ao aluno.")).toBeVisible();
    await expect(page.locator("pre")).toHaveCount(0);
    await expect(teacherNav.getByRole("link", { name: "Centro de Acompanhamento" })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await expect(teacherNav.getByRole("link", { name: "Estudo" })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Ações de criação" })).toHaveCount(0);
});

/**
 * Cria uma fixture agregada do dashboard docente para a navegação não depender de dados seedados.
 *
 * @returns Resposta compatível com `/api/teacher/dashboard`.
 */
function teacherDashboardFixture() {
    return {
        totals: {
            classes: 1,
            students: 2,
            subjects: 1,
            officialMaterials: 1,
            publishedTests: 1,
            pendingAiReviews: 0,
            approvedAiReviews: 1,
            posts: 1,
            progressNotes: 1,
            followUpRules: 1,
            inactiveStudents: 1,
        },
        attention: {
            classesWithoutSubjects: 0,
            classesWithoutMaterials: 0,
            classesWithLowActivity: 0,
            classesWithoutFollowUpRules: 0,
            pendingAiReviews: 0,
            inactiveStudents: 1,
        },
        followUp: {
            rulesCount: 1,
            classesWithRules: 1,
            classesWithoutRules: 0,
            inactiveStudentsCount: 1,
        },
        classes: [
            {
                classId: "507f1f77bcf86cd799439014",
                className: "12.º Demo",
                studentsCount: 2,
                subjectsCount: 1,
                officialMaterialsCount: 1,
                publishedTestsCount: 1,
                approvedAiContentCount: 1,
                pendingAiReviewsCount: 0,
                postCount: 1,
                noteCount: 1,
                followUpRulesCount: 1,
                inactiveStudentsCount: 1,
                openGuidedRoomsCount: 1,
                closedGuidedRoomsCount: 0,
                activityScorePercent: 100,
                activityStatus: "ALTA",
                activityBasis: [
                    "DISCIPLINES",
                    "OFFICIAL_MATERIALS",
                    "PUBLISHED_TESTS",
                    "POSTS",
                    "PROGRESS_NOTES",
                    "APPROVED_AI_CONTENT",
                    "FOLLOW_UP_RULES",
                ],
                difficultyTags: [],
                subjects: [
                    {
                        subjectId: "507f1f77bcf86cd799439016",
                        subjectName: "Matemática",
                        subjectCode: "MAT",
                        officialMaterialsCount: 1,
                        publishedTestsCount: 1,
                        pendingAiReviewsCount: 0,
                        openGuidedRoomsCount: 1,
                        closedGuidedRoomsCount: 0,
                    },
                ],
            },
        ],
        gaps: [],
    };
}

/**
 * Cria uma fixture estável para validar a página de turmas sem depender da seed local.
 *
 * @param withStudent Define se a turma deve vir com um aluno público associado.
 * @returns Lista mínima compatível com `/api/teacher/classes`.
 */
function teacherClassesFixture(withStudent: boolean) {
    const studentId = "507f1f77bcf86cd799439015";
    return [
        {
            _id: "507f1f77bcf86cd799439014",
            teacherId: "507f1f77bcf86cd799439012",
            name: "12.º Demo",
            code: "DEMO",
            schoolYear: "2025/2026",
            status: "ACTIVE",
            studentIds: withStudent ? [studentId] : [],
            students: withStudent
                ? [{ id: studentId, email: "aluno.dev@studyflow.local" }]
                : [],
            createdAt: "2026-02-01T00:00:00.000Z",
        },
        {
            _id: "507f1f77bcf86cd799439024",
            teacherId: "507f1f77bcf86cd799439012",
            name: "11.º Alpha",
            code: "ALFA",
            schoolYear: "2024/2025",
            status: "ACTIVE",
            studentIds: [],
            students: [],
            createdAt: "2026-01-01T00:00:00.000Z",
        },
    ];
}

/**
 * Cria disciplinas docentes para validar a pagina de gestão sem depender da seed local.
 *
 * @returns Lista mínima compatível com `/api/teacher/classes/:classId/subjects`.
 */
function teacherSubjectsFixture() {
    return [
        {
            _id: "507f1f77bcf86cd799439016",
            classId: "507f1f77bcf86cd799439014",
            teacherId: "507f1f77bcf86cd799439012",
            name: "Matemática",
            code: "MAT",
            description: "Disciplina nuclear da turma.",
            status: "ACTIVE",
            createdAt: "2026-02-01T00:00:00.000Z",
        },
        {
            _id: "507f1f77bcf86cd799439025",
            classId: "507f1f77bcf86cd799439014",
            teacherId: "507f1f77bcf86cd799439012",
            name: "Programação",
            code: "PROG",
            description: "Apoio a projectos e exercícios.",
            status: "ACTIVE",
            createdAt: "2026-01-01T00:00:00.000Z",
        },
    ];
}
