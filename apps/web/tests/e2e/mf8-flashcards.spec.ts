import { expect, test, type Page } from "@playwright/test";
import {
    createFlashcardPracticeState,
    moveToNextFlashcard,
    revealFlashcardAnswer,
    setFlashcardPracticeMode,
} from "../../src/features/mf8/flashcard-practice.js";

const student = {
    email: process.env.STUDYFLOW_E2E_STUDENT_EMAIL ?? "aluno.dev@studyflow.local",
    password: process.env.STUDYFLOW_E2E_STUDENT_PASSWORD ?? "aluno-dev-12345",
};

/**
 * Entra como aluno para manter sessao real baseada em cookies HttpOnly.
 *
 * @param page Pagina Playwright.
 * @returns Promise resolvida quando a shell autenticada esta pronta.
 */
async function loginAsStudent(page: Page): Promise<void> {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await page.getByLabel("Email").fill(student.email);
    await page.getByLabel("Password").fill(student.password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("button", { name: "Sair" })).toBeVisible();
}

test("MF8 flashcards: estado local esconde resposta e termina lista", () => {
    const initial = createFlashcardPracticeState();
    expect(initial.answerVisible).toBe(false);

    const revealed = revealFlashcardAnswer(initial);
    expect(revealed.answerVisible).toBe(true);

    const completed = moveToNextFlashcard(revealed, 1);
    expect(completed.completed).toBe(true);
    expect(completed.answerVisible).toBe(false);
});

test("MF8 flashcards: modo revisão mantém resposta visível ao avançar", () => {
    const review = setFlashcardPracticeMode(
        createFlashcardPracticeState(),
        "review",
    );
    const next = moveToNextFlashcard(review, 2);

    expect(next.currentIndex).toBe(1);
    expect(next.answerVisible).toBe(true);
    expect(next.completed).toBe(false);
});

test("MF8 flashcards: aluno revela resposta e conclui treino na UI", async ({
    page,
}) => {
    await loginAsStudent(page);

    await page.route(
        "**/api/study-areas/area-mf8-flashcards/summaries",
        async (route) => {
            await route.fulfill({
                contentType: "application/json",
                status: 200,
                body: "[]",
            });
        },
    );

    await page.route(
        "**/api/study-areas/area-mf8-flashcards/study-tools",
        async (route) => {
            // O teste devolve apenas dados mínimos e públicos para não expor materiais reais.
            await route.fulfill({
                contentType: "application/json",
                status: 200,
                body: JSON.stringify([
                    {
                        _id: "artifact-flashcards-mf8",
                        studyAreaId: "area-mf8-flashcards",
                        type: "FLASHCARDS",
                        contentJson: {
                            cards: [
                                {
                                    front: "Qual é a capital de Portugal?",
                                    back: "Lisboa.",
                                    sourceMaterialIds: ["material-geografia"],
                                },
                                {
                                    front: "Que oceano banha Portugal continental?",
                                    back: "Oceano Atlântico.",
                                    sourceMaterialIds: ["material-geografia"],
                                },
                            ],
                        },
                        sourcesJson: [
                            {
                                materialId: "material-geografia",
                                title: "Resumo de Geografia",
                            },
                        ],
                    },
                ]),
            });
        },
    );

    await page.goto("/app/areas/area-mf8-flashcards/ferramentas");

    await expect(page.getByRole("heading", { name: "Flashcards" })).toBeVisible();
    await expect(page.getByText("Qual é a capital de Portugal?")).toBeVisible();
    await expect(page.getByText("Lisboa.")).toHaveCount(0);

    await page.getByRole("button", { name: "Mostrar resposta" }).click();
    await expect(page.getByText("Lisboa.")).toBeVisible();

    await page.getByRole("button", { name: "Seguinte" }).click();
    await expect(
        page.getByText("Que oceano banha Portugal continental?"),
    ).toBeVisible();
    await expect(page.getByText("Oceano Atlântico.")).toHaveCount(0);

    await page.getByRole("button", { name: "Concluir" }).click();
    await expect(page.getByRole("status")).toContainText("Sessão concluída.");
});
