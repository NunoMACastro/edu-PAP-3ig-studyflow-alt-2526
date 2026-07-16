/** Validação E2E do cenário privado TIG, sem identidades copiadas para o código. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { resolve } from "node:path";
import {
    expectAuthenticatedShell,
    logoutFromShell,
} from "./authenticated-shell.js";

type Credentials = { email: string; password: string };
type SeedStudent = { id: string; displayName: string; email: string };
type SeedClass = {
    _id: string;
    name: string;
    status: "ACTIVE" | "ARCHIVED";
    students: SeedStudent[];
};
type SeedSubject = { _id: string; code: string };
type SeedTest = { _id: string; title: string; status: "DRAFT" | "PUBLISHED" | "CLOSED" };
type SeedRanking = {
    testTitle: string;
    rows: Array<{ displayName: string }>;
};
type SeedMaterialPage = {
    items: Array<{ _id: string; title: string; type: string }>;
};
type SeedCollaboration = {
    _id: string;
    name?: string;
    title?: string;
    members: Array<{ id: string; displayName: string }>;
};

const teacher: Credentials = {
    email: requiredEnvironment("STUDYFLOW_E2E_TEACHER_EMAIL"),
    password: requiredEnvironment("STUDYFLOW_E2E_TEACHER_PASSWORD"),
};
const student: Credentials = {
    email: requiredEnvironment("STUDYFLOW_E2E_STUDENT_EMAIL"),
    password: requiredEnvironment("STUDYFLOW_E2E_STUDENT_PASSWORD"),
};
const studentNames = [
    "STUDYFLOW_E2E_STUDENT_DISPLAY_NAME",
    "STUDYFLOW_E2E_SECOND_STUDENT_DISPLAY_NAME",
    "STUDYFLOW_E2E_THIRD_STUDENT_DISPLAY_NAME",
    "STUDYFLOW_E2E_FOURTH_STUDENT_DISPLAY_NAME",
].map(requiredEnvironment);

test.setTimeout(120_000);

/** Lê uma variável injetada pelo runner a partir de dados.md. */
function requiredEnvironment(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} não foi definida pelo runner E2E.`);
    return value;
}

/** Autentica pela interface e aguarda a shell protegida. */
async function login(page: Page, credentials: Credentials): Promise<void> {
    await page.goto("/login");
    await page.getByLabel("Email").fill(credentials.email);
    await page.getByLabel("Password").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expectAuthenticatedShell(page);
}

/** Executa um GET autenticado na origem local da aplicação. */
async function getJson<T>(page: Page, path: string): Promise<T> {
    return page.evaluate(async (requestPath) => {
        const response = await fetch(requestPath, { credentials: "include" });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(`GET ${requestPath} devolveu HTTP ${response.status}.`);
        }
        return body as T;
    }, path);
}

/** Impõe os gates visuais comuns a uma superfície representativa. */
async function expectVisualGates(page: Page): Promise<void> {
    expect(
        await page.evaluate(
            () =>
                document.documentElement.scrollWidth <=
                document.documentElement.clientWidth,
        ),
    ).toBe(true);
    const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
    expect(
        axe.violations.filter(
            ({ impact }) => impact === "serious" || impact === "critical",
        ),
    ).toEqual([]);
}

/** Guarda evidência visual apenas quando o diretório é pedido explicitamente. */
async function captureVisualEvidence(page: Page, fileName: string): Promise<void> {
    const directory = process.env.STUDYFLOW_E2E_VISUAL_DIR?.trim();
    if (!directory) return;
    await page.screenshot({
        fullPage: true,
        path: resolve(directory, fileName),
    });
}

test("professor consulta turma ativa, arquivo, nomes, salas e ranking sintético", async ({
    page,
}) => {
    await login(page, teacher);
    const classes = await getJson<SeedClass[]>(page, "/api/teacher/classes");
    expect(classes).toHaveLength(2);
    const activeClass = classes.find(({ status }) => status === "ACTIVE");
    const archivedClass = classes.find(({ status }) => status === "ARCHIVED");
    expect(activeClass?.students).toHaveLength(4);
    expect(archivedClass?.students).toHaveLength(4);
    expect(activeClass?.students.map(({ displayName }) => displayName).sort()).toEqual(
        [...studentNames].sort(),
    );

    await page.goto("/app/professor/turmas");
    await expect(page.getByRole("heading", { name: activeClass!.name })).toBeVisible();
    await page.getByRole("button", { name: "Gerir 4 alunos" }).click();
    for (const name of studentNames) {
        await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    await expectVisualGates(page);
    await captureVisualEvidence(page, "professor-turma-ativa.png");

    await page.getByLabel("Estado").selectOption("ARCHIVED");
    await expect(page.getByRole("heading", { name: archivedClass!.name })).toBeVisible();
    await expect(page.getByText("Arquivada · consulta")).toBeVisible();

    const subjects = await getJson<SeedSubject[]>(
        page,
        `/api/teacher/classes/${activeClass!._id}/subjects`,
    );
    expect(subjects.map(({ code }) => code).sort()).toEqual(["LP-12", "SI-12"]);
    const testGroups = await Promise.all(
        subjects.map((subject) =>
            getJson<SeedTest[]>(
                page,
                `/api/teacher/subjects/${subject._id}/tests`,
            ),
        ),
    );
    expect(testGroups.flat()).toHaveLength(6);
    const rankedTest = testGroups
        .flatMap((tests, index) =>
            tests.map((officialTest) => ({ officialTest, subject: subjects[index] })),
        )
        .find(({ officialTest }) => officialTest.status !== "DRAFT");
    expect(rankedTest?.officialTest.title).toMatch(/^Demonstração/);
    const ranking = await getJson<SeedRanking>(
        page,
        `/api/teacher/subjects/${rankedTest!.subject._id}/tests/${rankedTest!.officialTest._id}/ranking`,
    );
    expect(ranking.testTitle).toBe(rankedTest!.officialTest.title);
    expect(ranking.rows.length).toBeGreaterThan(0);
    expect(ranking.rows.every(({ displayName }) => studentNames.includes(displayName))).toBe(
        true,
    );
    await page.goto(
        `/app/professor/disciplinas/${rankedTest!.subject._id}/testes/${rankedTest!.officialTest._id}/ranking`,
    );
    await expect(page.getByRole("heading", { name: ranking.testTitle })).toBeVisible();
    await expect(page.getByText(/Pontuações e posições fictícias/)).toBeVisible();
    await expectVisualGates(page);
    await captureVisualEvidence(page, "professor-ranking-demonstracao.png");

    const guidedRooms = await getJson<unknown[]>(
        page,
        `/api/teacher/classes/${activeClass!._id}/guided-study-rooms`,
    );
    expect(guidedRooms).toHaveLength(4);
    await page.goto(`/app/professor/turmas/${activeClass!._id}/salas-guiadas`);
    await expect(page.getByRole("heading", { name: /Salas guiadas/ })).toBeVisible();
    await expectVisualGates(page);
});

test("aluno consulta turmas, material longo e membros autorizados em quatro viewports", async ({
    page,
}) => {
    await login(page, student);
    const accountButton = page.getByRole("button", {
        name: `Conta: ${studentNames[0]}`,
    });
    await expect(accountButton).toBeVisible();
    await accountButton.click();
    await expect(page.getByRole("menu").getByText(studentNames[0], { exact: true })).toBeVisible();
    await expect(page.getByRole("menu").getByText(student.email, { exact: true })).toBeVisible();

    const activeClasses = await getJson<SeedClass[]>(
        page,
        "/api/student/classes?status=ACTIVE",
    );
    const archivedClasses = await getJson<SeedClass[]>(
        page,
        "/api/student/classes?status=ARCHIVED",
    );
    expect(activeClasses).toHaveLength(1);
    expect(archivedClasses).toHaveLength(1);

    await page.goto("/app/estudar");
    await expect(page.getByRole("heading", { name: activeClasses[0].name })).toBeVisible();
    await page.getByRole("link", { name: "Arquivo" }).click();
    await expect(page.getByRole("heading", { name: archivedClasses[0].name })).toBeVisible();
    await expect(page.getByRole("link", { name: "Consultar turma" })).toBeVisible();

    const subjects = await getJson<SeedSubject[]>(
        page,
        `/api/student/classes/${activeClasses[0]._id}/subjects?status=ACTIVE`,
    );
    const materialPage = await getJson<SeedMaterialPage>(
        page,
        `/api/student/subjects/${subjects[0]._id}/materials?limit=24`,
    );
    const markdown = materialPage.items.find(({ type }) => type === "MARKDOWN");
    expect(markdown).toBeTruthy();

    const rooms = await getJson<SeedCollaboration[]>(page, "/api/study-rooms");
    const groups = await getJson<SeedCollaboration[]>(page, "/api/study-groups");
    expect(rooms).toHaveLength(2);
    expect(groups).toHaveLength(2);
    const room = rooms.find(({ members }) => members.length > 1) ?? rooms[0];
    const group = groups.find(({ members }) => members.length > 1) ?? groups[0];
    expect(room.members.length).toBeGreaterThan(1);
    expect(group.members.length).toBeGreaterThan(1);

    const surfaces = [
        {
            path: `/app/disciplinas/${subjects[0]._id}/materiais/${markdown!._id}`,
            ready: () => page.getByRole("heading", { name: markdown!.title }),
            label: "material",
        },
        {
            path: `/app/salas/${room._id}`,
            ready: () => page.getByRole("region", { name: "Membros da sala" }),
            label: "sala",
        },
        {
            path: `/app/grupos/${group._id}`,
            ready: () => page.getByRole("region", { name: "Membros do grupo" }),
            label: "grupo",
        },
        {
            path: "/app/estudar",
            ready: () => page.getByRole("heading", { name: activeClasses[0].name }),
            label: "estudar",
        },
    ];
    const viewports = [
        { width: 320, height: 720 },
        { width: 375, height: 812 },
        { width: 768, height: 1024 },
        { width: 1440, height: 900 },
    ];
    for (const [index, viewport] of viewports.entries()) {
        const surface = surfaces[index];
        await page.setViewportSize(viewport);
        await page.goto(surface.path);
        await expect(surface.ready()).toBeVisible();
        await expectVisualGates(page);
        await captureVisualEvidence(
            page,
            `aluno-${viewport.width}-${surface.label}.png`,
        );
    }

    await page.goto(`/app/salas/${room._id}`);
    const roomMembers = page.getByRole("region", { name: "Membros da sala" });
    for (const member of room.members) {
        await expect(roomMembers.getByText(member.displayName, { exact: true })).toBeVisible();
    }
    await page.goto(`/app/grupos/${group._id}`);
    const groupMembers = page.getByRole("region", { name: "Membros do grupo" });
    for (const member of group.members) {
        await expect(groupMembers.getByText(member.displayName, { exact: true })).toBeVisible();
    }

    await logoutFromShell(page);
});
