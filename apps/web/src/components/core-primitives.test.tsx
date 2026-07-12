/**
 * Exercita os blocos visuais e utilitários partilhados por várias rotas.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageHeader } from "./PageHeader.js";
import { FormField } from "./forms/FormField.js";
import { ResponsivePageFrame } from "./layout/ResponsivePageFrame.js";
import {
    IconTooltip,
    ShellIcon,
    type ShellIconName,
} from "./layout/shell-icons.js";
import { AsyncStateBlock } from "./ui/AsyncStateBlock.js";
import { EmptyState, InlineNotice, MetricStrip, StatusBadge, Toolbar } from "./ui/CalmUi.js";
import { Surface } from "./ui/Surface.js";
import {
    createFlashcardPracticeState,
    moveToNextFlashcard,
    restartFlashcardPractice,
    revealFlashcardAnswer,
    setFlashcardPracticeMode,
} from "../features/mf8/flashcard-practice.js";
import {
    finishPerformanceBudget,
    formatPerformanceBudgetMessage,
    startPerformanceBudget,
} from "../features/mf5/performance-budget.js";
import {
    isAiSafetyBlock,
    type AiGuardrailDecision,
} from "../features/ai-guardrails/check-ai-guardrails.js";
import { formatDatePt } from "../lib/format-date-pt.js";
import { isMessageKey, messageKeys, t, tOrDefault } from "../lib/messages.js";

describe("primitivos visuais acessíveis", () => {
    it("compõe superfícies, toolbar, métricas, badges, notices e empty states", () => {
        render(
            <>
                <Surface data-testid="danger-surface" tone="danger" variant="elevated">Zona sensível</Surface>
                <Toolbar ariaLabel="Ferramentas"><span>2 resultados</span></Toolbar>
                <MetricStrip ariaLabel="Resumo" items={[{ label: "Áreas", value: 2 }]} />
                <StatusBadge tone="brand">Ativo</StatusBadge>
                <InlineNotice tone="attention">Requer atenção</InlineNotice>
                <EmptyState title="Sem dados" />
            </>,
        );
        expect(screen.getByTestId("danger-surface").className).toContain("sf-surface-tone-danger");
        expect(screen.getByRole("region", { name: "Ferramentas" })).toBeTruthy();
        expect(screen.getByLabelText("Resumo")).toBeTruthy();
        expect(screen.getByText("Ativo").className).toContain("sf-badge-brand");
        expect(screen.getByRole("status").textContent).toContain("Requer atenção");
        expect(screen.getByRole("heading", { name: "Sem dados" })).toBeTruthy();
    });

    it.each([
        { isLoading: true, isEmpty: false, expected: "A carregar dados..." },
        { isLoading: false, error: "Falha segura", isEmpty: false, expected: "Falha segura" },
        { isLoading: false, isEmpty: true, expected: "Sem resultados" },
        { isLoading: false, isEmpty: false, expected: "Conteúdo pronto" },
    ])("representa cada estado assíncrono", (props) => {
        render(
            <AsyncStateBlock
                error={props.error}
                isEmpty={props.isEmpty}
                isLoading={props.isLoading}
                emptyMessage="Sem resultados"
            >
                <span>Conteúdo pronto</span>
            </AsyncStateBlock>,
        );
        expect(screen.getByText(props.expected)).toBeTruthy();
    });

    it("associa ajuda e erro ao controlo de formulário", () => {
        render(
            <FormField
                error="Campo obrigatório"
                helpText="Usa um nome curto"
                id="name"
                label="Nome"
            >
                <input aria-describedby="external-description" />
            </FormField>,
        );

        const input = screen.getByLabelText("Nome");
        expect(input.getAttribute("aria-describedby")).toBe(
            "external-description name-help name-error",
        );
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(screen.getByRole("alert").textContent).toContain("Campo obrigatório");
    });

    it("aceita campos sem ajuda nem erro", () => {
        render(
            <FormField id="code" label="Código">
                <input />
            </FormField>,
        );
        expect(screen.getByLabelText("Código").getAttribute("aria-invalid")).toBe("false");
    });

    it("compõe cabeçalho e frame com e sem zona secundária", () => {
        const { rerender } = render(
            <>
                <PageHeader
                    action={<button type="button">Criar</button>}
                    description="Descrição"
                    title="Título"
                />
                <ResponsivePageFrame
                    aside={<div>Filtros</div>}
                    asideLabel="Filtros da lista"
                    main={<div>Lista</div>}
                />
            </>,
        );
        expect(screen.getByRole("heading", { name: "Título" })).toBeTruthy();
        expect(screen.getByRole("complementary", { name: "Filtros da lista" })).toBeTruthy();

        rerender(
            <>
                <PageHeader description="Descrição" title="Título" />
                <ResponsivePageFrame main={<div>Lista única</div>} />
            </>,
        );
        expect(screen.queryByRole("complementary")).toBeNull();
        expect(screen.getByText("Lista única")).toBeTruthy();
    });

    it("renderiza toda a iconografia permitida e posiciona tooltips sem depender do viewport", () => {
        const names: ShellIconName[] = [
            "arrowRight", "bell", "book", "calendar", "chart", "clipboard",
            "file", "folder", "graduation", "history", "home", "help", "info",
            "lock", "logOut", "menu", "megaphone", "message", "plus", "shield",
            "spark", "trash", "user", "users",
        ];
        const { container } = render(
            <>
                {names.map((name) => <ShellIcon data-testid={`icon-${name}`} key={name} name={name} />)}
                <IconTooltip>Direita</IconTooltip>
                <IconTooltip align="center">Centro</IconTooltip>
                <IconTooltip side="right">Lateral</IconTooltip>
                <IconTooltip align="center" side="top">Superior</IconTooltip>
            </>,
        );
        expect(container.querySelectorAll("svg")).toHaveLength(names.length);
        expect(screen.getByText("Direita").className).toContain("right-0");
        expect(screen.getByText("Centro").className).toContain("left-1/2");
        expect(screen.getByText("Lateral").className).toContain("left-full");
        expect(screen.getByText("Lateral").getAttribute("data-tooltip-side")).toBe("right");
        expect(screen.getByText("Superior").className).toContain("bottom-full");
    });
});

describe("utilitários determinísticos", () => {
    it("formata datas válidas e distingue valores ausentes e inválidos", () => {
        expect(formatDatePt("2026-07-10T12:00:00.000Z")).toMatch(/10\/07\/2026/);
        expect(formatDatePt(new Date("2026-01-02T12:00:00.000Z"))).toMatch(/02\/01\/2026/);
        expect(formatDatePt(null)).toBe("Data indisponível");
        expect(formatDatePt(undefined)).toBe("Data indisponível");
        expect(formatDatePt("")).toBe("Data indisponível");
        expect(formatDatePt("não-é-data")).toBe("Data inválida");
    });

    it("resolve mensagens tipadas e aplica fallback a chaves desconhecidas", () => {
        expect(isMessageKey(messageKeys.sourceTitle)).toBe(true);
        expect(isMessageKey("internal.unknown")).toBe(false);
        expect(t(messageKeys.sourceTitle)).toBe("Resposta com fontes");
        expect(tOrDefault(messageKeys.guardrailsAllowed)).toBe("Permitido");
        expect(tOrDefault("internal.unknown")).toBe("Mensagem indisponível.");
    });

    it("mantém todas as transições da prática de flashcards imutáveis", () => {
        const initial = createFlashcardPracticeState();
        expect(initial).toEqual({ currentIndex: 0, answerVisible: false, completed: false, mode: "exercise" });
        expect(revealFlashcardAnswer(initial)).toMatchObject({ answerVisible: true });
        expect(moveToNextFlashcard(initial, 2)).toMatchObject({ currentIndex: 1, completed: false });
        expect(moveToNextFlashcard(initial, 0)).toMatchObject({ currentIndex: 0, completed: true });
        expect(moveToNextFlashcard(initial, -3)).toMatchObject({ completed: true });

        const review = setFlashcardPracticeMode(initial, "review");
        expect(review).toMatchObject({ mode: "review", answerVisible: true });
        expect(moveToNextFlashcard(review, 1)).toMatchObject({ completed: true, answerVisible: true });
        expect(setFlashcardPracticeMode(review, "exercise").answerVisible).toBe(false);
        expect(restartFlashcardPractice("review")).toEqual(createFlashcardPracticeState("review"));
        expect(restartFlashcardPractice()).toEqual(initial);
    });

    it("classifica apenas códigos éticos como bloqueios de segurança", () => {
        const decision = (reasonCode: AiGuardrailDecision["reasonCode"]): AiGuardrailDecision => ({
            _id: "decision-id",
            allowed: false,
            checkedAt: "2026-07-10T00:00:00.000Z",
            contextType: "SOLO",
            reason: "Motivo",
            reasonCode,
            resourceId: "resource-id",
        });
        expect(isAiSafetyBlock(decision("BIAS_RISK"))).toBe(true);
        expect(isAiSafetyBlock(decision("NON_PEDAGOGICAL"))).toBe(true);
        expect(isAiSafetyBlock(decision("UNSAFE_REQUEST"))).toBe(true);
        expect(isAiSafetyBlock(decision("CONTEXT_FORBIDDEN"))).toBe(false);
    });

    it("calcula budgets sem durações negativas", () => {
        const now = vi.spyOn(performance, "now");
        now.mockReturnValueOnce(100).mockReturnValueOnce(125);
        const measurement = startPerformanceBudget("dashboard");
        const result = finishPerformanceBudget(measurement, 20);
        expect(result).toEqual({ name: "dashboard", durationMs: 25, budgetMs: 20, exceeded: true });
        expect(formatPerformanceBudgetMessage(result)).toContain("25 ms");

        now.mockReturnValueOnce(50);
        expect(finishPerformanceBudget({ name: "clock", startedAtMs: 100 }, 100)).toMatchObject({ durationMs: 0, exceeded: false });
        now.mockRestore();
    });
});
