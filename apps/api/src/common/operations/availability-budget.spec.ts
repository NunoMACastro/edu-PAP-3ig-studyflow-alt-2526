// apps/api/src/common/operations/availability-budget.spec.ts
import { evaluateAvailabilityBudget } from "./availability-budget.js";

describe("evaluateAvailabilityBudget", () => {
    it("mantem estado saudavel abaixo do aviso operacional", () => {
        // Abaixo do limiar de aviso, a app continua saudável e não deve alarmar a equipa.
        expect(evaluateAvailabilityBudget(30)).toEqual({
            downtimeMinutes: 30,
            limitMinutes: 60,
            status: "HEALTHY",
        });
    });

    it("marca aviso aos 80 por cento do limite mensal", () => {
        expect(evaluateAvailabilityBudget(48)).toEqual({
            downtimeMinutes: 48,
            limitMinutes: 60,
            status: "WARNING",
        });
    });

    it("marca a meta como violada ao atingir uma hora mensal", () => {
        expect(evaluateAvailabilityBudget(60)).toEqual({
            downtimeMinutes: 60,
            limitMinutes: 60,
            status: "BREACHED",
        });
    });

    it("mantem a meta violada acima de uma hora mensal", () => {
        expect(evaluateAvailabilityBudget(90)).toEqual({
            downtimeMinutes: 90,
            limitMinutes: 60,
            status: "BREACHED",
        });
    });

    it("recusa métricas inválidas", () => {
        // Um valor negativo esconderia falhas reais e tornaria a evidence enganadora.
        expect(() => evaluateAvailabilityBudget(-1)).toThrow(
            "downtimeMinutes deve ser um número positivo ou zero.",
        );
    });
});