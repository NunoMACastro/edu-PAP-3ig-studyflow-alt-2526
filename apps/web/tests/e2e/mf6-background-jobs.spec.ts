import { expect, test, type Page } from "@playwright/test";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

type StudyArea = {
    _id: string;
    name: string;
};

type StudyMaterial = {
    _id: string;
    title: string;
};

type MaterialIndexJob = {
    _id: string;
    materialId: string;
    status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
    errorMessage?: string;
};

type QuizGenerationJob = {
    _id: string;
    status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
    artifactId?: string;
    errorMessage?: string;
};

/**
 * Entra pela UI para garantir cookie HttpOnly real no contexto do browser.
 *
 * @param page Página Playwright usada para interagir com a UI real durante o teste.
 * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    if (await page.getByRole("button", { name: "Sair" }).isVisible()) {
        await page.getByRole("button", { name: "Sair" }).click();
        await expect(page.getByLabel("Email")).toBeVisible();
    }
    await expect(page.getByLabel("Email")).toBeVisible();
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

/**
 * Executa um pedido autenticado a partir do browser, reutilizando a sessao real da UI.
 *
 * @param page Pagina Playwright autenticada.
 * @param method Metodo HTTP.
 * @param path Caminho relativo da API.
 * @param body Payload opcional.
 * @returns JSON devolvido pela API.
 */
async function apiRequest<T>(
    page: Page,
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>,
): Promise<T> {
    return page.evaluate(
        async ({ requestMethod, requestPath, requestBody }) => {
            const response = await fetch(requestPath, {
                method: requestMethod,
                credentials: "include",
                headers: {
                    "content-type": "application/json",
                    "x-studyflow-csrf": "1",
                },
                body: requestBody ? JSON.stringify(requestBody) : undefined,
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const message =
                    typeof payload.message === "string"
                        ? payload.message
                        : `${requestMethod} ${requestPath} devolveu HTTP ${response.status}.`;
                throw new Error(message);
            }

            return payload;
        },
        { requestMethod: method, requestPath: path, requestBody: body },
    ) as Promise<T>;
}

/**
 * Consulta um job ate chegar a um estado terminal sem bloquear o teste.
 *
 * @param load Funcao de leitura do job.
 * @returns Job final.
 */
async function pollTerminalJob<T extends { status: string }>(
    load: () => Promise<T>,
): Promise<T> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
        const job = await load();
        if (job.status === "DONE" || job.status === "FAILED") return job;
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error("Job nao chegou a estado terminal dentro do tempo esperado.");
}

test("MF6 smoke: indexacao e quiz em background usam HTTP autenticado real", async ({ page }) => {
    const suffix = Date.now().toString(36);
    const areaName = `Area MF6 Smoke ${suffix}`;
    const materialTitle = `Material MF6 Smoke ${suffix}`;

    await loginAsStudent(page);

    const area = await apiRequest<StudyArea>(page, "POST", "/api/study-areas", {
        name: areaName,
        description: "Area privada criada pelo smoke MF6.",
    });

    const material = await apiRequest<StudyMaterial>(
        page,
        "POST",
        `/api/study-areas/${area._id}/materials`,
        {
            type: "TOPIC",
            title: materialTitle,
            topicText:
                "A fotossintese transforma luz, agua e dioxido de carbono em glicose e oxigenio.",
        },
    );

    const queuedIndexJob = await apiRequest<MaterialIndexJob>(
        page,
        "POST",
        `/api/student/study-areas/${area._id}/materials/${material._id}/index-jobs`,
    );
    expect(queuedIndexJob).toHaveProperty("status");
    expect(queuedIndexJob.status).toBe("QUEUED");
    expect(queuedIndexJob.materialId).toBe(material._id);

    const finishedIndexJob = await pollTerminalJob(() =>
        apiRequest<MaterialIndexJob>(
            page,
            "GET",
            `/api/material-index-jobs/${queuedIndexJob._id}`,
        ),
    );
    expect(finishedIndexJob.status).toBe("DONE");

    const emptyArea = await apiRequest<StudyArea>(page, "POST", "/api/study-areas", {
        name: `Area MF6 Sem Fontes ${suffix}`,
        description: "Area sem fontes usada para negativo de quiz.",
    });
    await expect(
        apiRequest<QuizGenerationJob>(
            page,
            "POST",
            `/api/study-areas/${emptyArea._id}/study-tools/quiz-jobs`,
            { topic: "fotossintese" },
        ),
    ).rejects.toThrow(/texto processavel|processável|fonte/i);

    await page.goto(`/app/areas/${area._id}/ferramentas`);
    await expect(page.getByRole("heading", { name: "IA da área" })).toBeVisible();
    await page.getByRole("combobox").selectOption("QUIZ");
    await page.getByPlaceholder("Tópico opcional").fill("fotossíntese");
    await page.getByRole("button", { name: "Gerar", exact: true }).click();
    await expect(
        page.getByText(/Quiz em fila|Quiz em processamento|Quiz pronto para resolver/),
    ).toBeVisible();
    await expect(page.getByText("Quiz pronto para resolver.")).toBeVisible({
        timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: /Quiz|Perguntas/ })).toBeVisible();
});
