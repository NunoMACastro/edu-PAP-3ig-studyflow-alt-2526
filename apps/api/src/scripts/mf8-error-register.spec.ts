import {
    buildCorrectionRegister,
    canCloseMf8Error,
    extractFinalTestRows,
    renderCorrectionRegisterMarkdown,
    type Mf8ErrorRecord,
} from "./mf8-error-register.js";

const validRetestedRecord: Mf8ErrorRecord = {
    id: "MF8-ERR-01",
    source: "api",
    command: "npm --prefix real_dev/api run test:unit",
    observed: "A suite falhou antes da correção.",
    cause: "O teste final encontrou uma falha de validação.",
    fix: "A regra de validação foi corrigida no ficheiro responsável.",
    validation: "O comando voltou a executar com estado PASS.",
    status: "RETESTED",
    privacyNote: "A evidence não inclui tokens, cookies nem dados pessoais.",
};

describe("registo de correção de erros da MF8", () => {
    it("fecha erro revalidado com causa, correção e validação", () => {
        expect(canCloseMf8Error(validRetestedRecord)).toBe(true);
    });

    it("não fecha erro sem causa", () => {
        const recordWithoutCause: Mf8ErrorRecord = {
            ...validRetestedRecord,
            cause: "",
        };

        // Sem causa, a equipa não consegue explicar o que corrigiu na defesa.
        expect(canCloseMf8Error(recordWithoutCause)).toBe(false);
    });

    it("não fecha erro reaberto", () => {
        const reopenedRecord: Mf8ErrorRecord = {
            ...validRetestedRecord,
            status: "OPEN",
        };

        // OPEN significa que ainda falta correção ou revalidação, mesmo que exista descrição.
        expect(canCloseMf8Error(reopenedRecord)).toBe(false);
    });

    it("cria registo bloqueado a partir de comandos finais em FAIL ou BLOQUEADO", () => {
        const markdown = [
            "# TESTES-FINAIS - MF8",
            "",
            "| comando | estado | observed |",
            "| --- | --- | --- |",
            "| npm --prefix real_dev/api run test:unit | PASS | 64 suites passaram. |",
            "| npm --prefix real_dev/web run build | FAIL | TypeScript encontrou erro em componente. |",
            "| bash scripts/validate-planificacao.sh | BLOQUEADO | Faltou ficheiro de evidence. |",
        ].join("\n");

        const rows = extractFinalTestRows(markdown);
        const register = buildCorrectionRegister(
            rows,
            new Date("2026-07-02T10:00:00.000Z"),
        );
        const output = renderCorrectionRegisterMarkdown(register);

        expect(register.records).toHaveLength(2);
        expect(register.decision).toBe("BLOCKED");
        expect(output).toContain("MF8-ERR-01");
        expect(output).toContain("MF8-ERR-02");
        expect(output).toContain("authoritative_for_release: false");
        expect(output).toContain("BLOQUEADO_HISTORICO");
        expect(output).not.toContain("64 suites passaram");
    });

    it("extrai a linha executada da tabela real de TESTES-FINAIS", () => {
        const markdown = [
            "| Obrigatório | Comando | Estado | Exit code | Linha executada |",
            "| --- | --- | --- | --- | --- |",
            "| Não | E2E Playwright da web | BLOQUEADO | 1 | `npm --prefix real_dev/web run test:e2e` |",
        ].join("\n");

        const rows = extractFinalTestRows(markdown);
        const register = buildCorrectionRegister(
            rows,
            new Date("2026-07-02T10:00:00.000Z"),
        );

        expect(rows).toEqual([
            {
                command: "npm --prefix real_dev/web run test:e2e",
                status: "BLOQUEADO",
                observed:
                    "E2E Playwright da web; exit code 1; linha executada npm --prefix real_dev/web run test:e2e.",
            },
        ]);
        expect(register.records[0]?.source).toBe("web");
        expect(register.records[0]?.status).toBe("BLOCKED");
    });
});
