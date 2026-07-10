/**
 * Testa o comportamento de infraestrutura comum e documenta os cenários de aceitação automatizados.
 */
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { SessionGuard } from "./session.guard.js";

describe("SessionGuard", () => {
    /**
     * Confirma que falta de cookie segue o contrato público do BK-MF0-02.
     */
    it("devolve UNAUTHENTICATED quando não há cookie de sessão", async () => {
        const sessionService = { requireSession: jest.fn() };
        const guard = new SessionGuard(sessionService as never);
        const context = makeContext({ cookies: {} });

        await expect(guard.canActivate(context)).rejects.toMatchObject({
            response: {
                code: "UNAUTHENTICATED",
            },
        });
        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        expect(sessionService.requireSession).not.toHaveBeenCalled();
    });

    /**
     * Confirma que uma sessão válida continua a preencher `request.user`.
     */
    it("anexa utilizador quando a sessão é válida", async () => {
        const user = {
            id: "507f1f77bcf86cd799439012",
            email: "aluno@example.com",
            role: "STUDENT",
        };
        const request = { cookies: { sf_sid: "sid" } };
        const sessionService = { requireSession: jest.fn().mockResolvedValue(user) };
        const guard = new SessionGuard(sessionService as never);

        await expect(guard.canActivate(makeContext(request))).resolves.toBe(true);
        expect(request).toMatchObject({ user });
        expect(sessionService.requireSession).toHaveBeenCalledWith("sid");
    });
});

/**
 * Cria o mínimo de `ExecutionContext` necessário para testar o guard.
 *
 * @param request Pedido HTTP falso.
 * @returns Contexto NestJS parcial.
 */
function makeContext(request: Record<string, unknown>): ExecutionContext {
    return {
        /**
         * Executa o apoio de teste para controlo de sessão, mantendo o cenário legível e próximo do comportamento real validado.
         *
         * @returns Resultado da operação no formato esperado pelo chamador.
         */
        switchToHttp: () => ({
            /**
             * Obtém o apoio de teste para controlo de sessão, mantendo o cenário legível e próximo do comportamento real validado.
             *
             * @returns Resultado da operação no formato esperado pelo chamador.
             */
            getRequest: () => request,
        }),
    } as ExecutionContext;
}
