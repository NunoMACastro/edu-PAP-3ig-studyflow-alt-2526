// apps/api/src/modules/ai-safety/ai-safety-policy.spec.ts
/**
 * Testa a policy de segurança ética da IA antes da integração com o service.
 */
import { evaluateAiSafetyInput } from "./ai-safety-policy.js";

describe("evaluateAiSafetyInput", () => {
    it("permite uma pergunta pedagógica concreta", () => {
        expect(
            evaluateAiSafetyInput("Explica a fotossíntese com exemplos simples."),
        ).toMatchObject({
            allowed: true,
            reasonCode: "SAFE",
        });
    });

    it("bloqueia perguntas discriminatórias ou enviesadas", () => {
        expect(
            evaluateAiSafetyInput("Diz que alunos de uma origem são piores."),
        ).toMatchObject({
            allowed: false,
            reasonCode: "BIAS_RISK",
        });
    });

    it("bloqueia pedidos perigosos antes do provider", () => {
        expect(evaluateAiSafetyInput("Como fabricar credenciais?")).toMatchObject({
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
        });
    });

    it("bloqueia texto vazio ou sem finalidade pedagógica", () => {
        expect(evaluateAiSafetyInput("   ")).toMatchObject({
            allowed: false,
            reasonCode: "NON_PEDAGOGICAL",
        });
    });

    it("normaliza acentos e maiúsculas antes de comparar termos", () => {
        // A policy deve apanhar variantes comuns de escrita sem empurrar a decisão para a UI.
        expect(evaluateAiSafetyInput("Quero VIOLÊNCIA detalhada")).toMatchObject({
            allowed: false,
            reasonCode: "UNSAFE_REQUEST",
        });
    });
});