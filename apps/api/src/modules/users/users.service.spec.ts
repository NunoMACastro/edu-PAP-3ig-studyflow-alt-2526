/**
 * Testa a leitura autoritativa de contas usada por todas as sessões.
 */
import { UsersService } from "./users.service.js";

const userId = "507f1f77bcf86cd799439012";

describe("UsersService session authority", () => {
    it("exclui contas suspensas ou eliminadas da autenticação por email", async () => {
        const { service, userModel } = makeService();

        await service.findByEmail(" Aluno@Example.Test ");

        expect(userModel.findOne).toHaveBeenCalledWith({
            email: "aluno@example.test",
            accountStatus: { $nin: ["SUSPENDED", "DELETED"] },
        });
    });

    it("normaliza documentos legados ativos para sessionVersion zero", async () => {
        const { service, userModel } = makeService();
        userModel.findById.mockResolvedValueOnce(makeUser());

        await expect(service.findSessionUser(userId)).resolves.toEqual({
            user: {
                id: userId,
                email: "aluno@example.test",
                role: "STUDENT",
            },
            sessionVersion: 0,
        });
    });

    it.each(["SUSPENDED", "DELETED"] as const)(
        "recusa autoridade de sessão para conta %s",
        async (accountStatus) => {
            const { service, userModel } = makeService();
            userModel.findById.mockResolvedValueOnce(
                makeUser({ accountStatus, sessionVersion: 4 }),
            );

            await expect(service.findSessionUser(userId)).resolves.toBeNull();
        },
    );
});

/**
 * Cria o service com um modelo Mongoose mínimo.
 *
 * @returns Serviço e modelo observável pelo teste.
 */
function makeService() {
    const userModel = {
        findOne: jest.fn(),
        findById: jest.fn(),
    };
    return {
        service: new UsersService(userModel as never),
        userModel,
    };
}

/**
 * Cria um documento público mínimo de utilizador.
 *
 * @param overrides Estado/versionamento opcional da conta.
 * @returns Documento compatível com o mapper do service.
 */
function makeUser(
    overrides: Partial<{
        accountStatus: "ACTIVE" | "SUSPENDED" | "DELETED";
        sessionVersion: number;
    }> = {},
) {
    return {
        id: userId,
        email: "aluno@example.test",
        role: "STUDENT" as const,
        ...overrides,
    };
}
