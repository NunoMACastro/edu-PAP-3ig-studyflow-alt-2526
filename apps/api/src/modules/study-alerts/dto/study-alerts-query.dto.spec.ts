/**
 * Testa o comportamento de alertas de estudo e documenta os cenários de aceitação automatizados.
 */
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { StudyAlertsQueryDto } from "./study-alerts-query.dto.js";

describe("StudyAlertsQueryDto", () => {
    it("transforma strings booleanas válidas", async () => {
        const enabled = plainToInstance(StudyAlertsQueryDto, {
            onlyUpcoming: "true",
        });
        const disabled = plainToInstance(StudyAlertsQueryDto, {
            onlyUpcoming: "false",
        });

        await expect(validate(enabled)).resolves.toHaveLength(0);
        await expect(validate(disabled)).resolves.toHaveLength(0);
        expect(enabled.onlyUpcoming).toBe(true);
        expect(disabled.onlyUpcoming).toBe(false);
    });

    it("rejeita valores de query que não são booleanos", async () => {
        const dto = plainToInstance(StudyAlertsQueryDto, {
            onlyUpcoming: "talvez",
        });

        await expect(validate(dto)).resolves.toHaveLength(1);
    });
});
