/** Testa apenas os gates do bootstrap; nunca cria contas nem abre sockets. */
import { normaliseAdminBootstrapOptions } from "./bootstrap-local-admin.js";

const valid = {
    allowBootstrap: true,
    nodeEnv: "development",
    email: "admin.local@studyflow.test",
    password: "Admin-Local-2026!",
};

describe("normaliseAdminBootstrapOptions", () => {
    it("aceita credencial forte fornecida explicitamente", () => {
        expect(normaliseAdminBootstrapOptions(valid)).toEqual({
            email: "admin.local@studyflow.test",
            password: valid.password,
        });
    });

    it.each([
        [{ ...valid, allowBootstrap: false }, "ALLOW_ADMIN_BOOTSTRAP"],
        [{ ...valid, nodeEnv: "production" }, "NODE_ENV"],
        [{ ...valid, email: "invalido" }, "ADMIN_EMAIL"],
        [{ ...valid, password: "password-curta" }, "ADMIN_PASSWORD"],
        [{ ...valid, password: "A".repeat(73) + "1!a" }, "72 bytes"],
    ])("recusa configuração insegura", (options, message) => {
        expect(() => normaliseAdminBootstrapOptions(options)).toThrow(message);
    });
});
