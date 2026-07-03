/**
 * Testa a normalizacao pedagogica usada pela IA da sala.
 */
import { resolveRoomAiPedagogicalContext } from "./room-ai-pedagogy.js";

describe("resolveRoomAiPedagogicalContext", () => {
    it.each(["4º ano", "4.º ano", "4 ano"])(
        "reconhece %s como 1.º ciclo",
        (year) => {
            expect(resolveRoomAiPedagogicalContext(year)).toMatchObject({
                stage: "PRIMARY",
                yearLabel: "4.º ano",
            });
        },
    );

    it("reconhece 12.º ano como secundario", () => {
        expect(resolveRoomAiPedagogicalContext("12.º ano")).toMatchObject({
            stage: "UPPER_SECONDARY",
            yearLabel: "12.º ano",
        });
    });

    it.each(["faculdade", "ensino superior", "licenciatura"])(
        "reconhece %s como ensino superior",
        (year) => {
            expect(resolveRoomAiPedagogicalContext(year)).toMatchObject({
                stage: "HIGHER_EDUCATION",
                yearLabel: "ensino superior",
            });
        },
    );

    it.each(["", "ano letivo", null, undefined])(
        "devolve UNKNOWN para ano vazio ou ambiguo",
        (year) => {
            expect(resolveRoomAiPedagogicalContext(year)).toMatchObject({
                stage: "UNKNOWN",
                yearLabel: null,
            });
        },
    );
});
