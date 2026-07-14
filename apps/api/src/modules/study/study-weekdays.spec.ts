import { formatStudyWeekdaysPt } from "./study-weekdays.js";

describe("formatStudyWeekdaysPt", () => {
    it("localiza valores legacy em inglês sem alterar a ordem", () => {
        expect(formatStudyWeekdaysPt(["TUESDAY", "THURSDAY"]))
            .toBe("Terça-feira e quinta-feira");
        expect(formatStudyWeekdaysPt(["MONDAY", "WEDNESDAY", "FRIDAY"]))
            .toBe("Segunda-feira, quarta-feira e sexta-feira");
    });

    it("aceita os valores canónicos portugueses e ignora entradas vazias", () => {
        expect(formatStudyWeekdaysPt(["segunda", "quarta", "sexta"]))
            .toBe("Segunda-feira, quarta-feira e sexta-feira");
        expect(formatStudyWeekdaysPt([" "])).toBe("");
    });
});
