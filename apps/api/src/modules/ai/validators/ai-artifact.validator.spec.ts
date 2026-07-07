/**
 * Testa o comportamento de ai e documenta os cenários de aceitação automatizados.
 */
import { BadGatewayException } from "@nestjs/common";
import {
    validateStudyToolArtifact,
    validateSummaryArtifact,
} from "./ai-artifact.validator.js";

describe("AI artifact validators", () => {
    /**
     * Confirma que resumos sem fontes materiais são rejeitados.
     */
    it("rejeita resumo sem fontes", () => {
        expect(() =>
            validateSummaryArtifact(
                {
                    title: "Resumo",
                    bullets: ["Ponto factual."],
                    sourceMaterialIds: [],
                },
                ["material-1"],
            ),
        ).toThrow(BadGatewayException);
    });

    /**
     * Confirma que explicações precisam de fontes por secção.
     */
    it("rejeita explicação sem fontes por secção", () => {
        expect(() =>
            validateStudyToolArtifact(
                "EXPLANATION",
                {
                    title: "Explicação",
                    sections: [
                        {
                            heading: "Conceito",
                            body: "Texto explicativo.",
                            sourceMaterialIds: [],
                        },
                    ],
                },
                ["material-1"],
            ),
        ).toThrow(BadGatewayException);
    });

    /**
     * Confirma que flashcards não podem referenciar materiais fora do prompt.
     */
    it("rejeita flashcard com fonte desconhecida", () => {
        expect(() =>
            validateStudyToolArtifact(
                "FLASHCARDS",
                {
                    cards: [
                        {
                            front: "Pergunta",
                            back: "Resposta",
                            sourceMaterialIds: ["material-2"],
                        },
                    ],
                },
                ["material-1"],
            ),
        ).toThrow(BadGatewayException);
    });

    /**
     * Confirma que quizzes exigem opções distintas e fontes válidas.
     */
    it("rejeita quiz com opções duplicadas", () => {
        expect(() =>
            validateStudyToolArtifact(
                "QUIZ",
                {
                    questions: [
                        {
                            question: "Pergunta?",
                            options: ["A", "A", "B", "C"],
                            correctOptionIndex: 0,
                            explanation: "Porque A.",
                            sourceMaterialIds: ["material-1"],
                        },
                    ],
                },
                ["material-1"],
            ),
        ).toThrow(BadGatewayException);
    });
});
