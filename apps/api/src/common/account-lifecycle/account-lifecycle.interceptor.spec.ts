/** Testes da integração HTTP da barreira de mutações autenticadas. */
import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { lastValueFrom, of, throwError } from "rxjs";
import { AccountLifecycleInterceptor } from "./account-lifecycle.interceptor.js";

describe("AccountLifecycleInterceptor", () => {
    it("mantém a lease até uma mutação autenticada terminar", async () => {
        const release = jest.fn();
        const barrier = {
            enterMutation: jest.fn().mockReturnValue(release),
        };
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(false),
        };
        const interceptor = new AccountLifecycleInterceptor(
            reflector as never,
            barrier as never,
        );

        const response = interceptor.intercept(
            makeContext({ method: "PATCH", userId: "user-1" }),
            { handle: () => of("ok") } as CallHandler,
        );

        await expect(lastValueFrom(response)).resolves.toBe("ok");
        expect(barrier.enterMutation).toHaveBeenCalledWith("user-1");
        expect(release).toHaveBeenCalledTimes(1);
    });

    it("liberta a lease quando o handler falha", async () => {
        const release = jest.fn();
        const interceptor = new AccountLifecycleInterceptor(
            { getAllAndOverride: jest.fn().mockReturnValue(false) } as never,
            { enterMutation: jest.fn().mockReturnValue(release) } as never,
        );

        const response = interceptor.intercept(
            makeContext({ method: "POST", userId: "user-1" }),
            {
                handle: () => throwError(() => new Error("handler failed")),
            } as CallHandler,
        );

        await expect(lastValueFrom(response)).rejects.toThrow("handler failed");
        expect(release).toHaveBeenCalledTimes(1);
    });

    it("ignora GET, pedidos anónimos e o endpoint exclusivo", async () => {
        const barrier = { enterMutation: jest.fn() };
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValue(true),
        };
        const interceptor = new AccountLifecycleInterceptor(
            reflector as never,
            barrier as never,
        );

        await lastValueFrom(
            interceptor.intercept(
                makeContext({ method: "GET", userId: "user-1" }),
                { handle: () => of("get") } as CallHandler,
            ),
        );
        await lastValueFrom(
            interceptor.intercept(
                makeContext({ method: "POST" }),
                { handle: () => of("anonymous") } as CallHandler,
            ),
        );
        await lastValueFrom(
            interceptor.intercept(
                makeContext({ method: "POST", userId: "user-1" }),
                { handle: () => of("exclusive") } as CallHandler,
            ),
        );

        expect(barrier.enterMutation).not.toHaveBeenCalled();
    });
});

function makeContext(options: {
    method: string;
    userId?: string;
}): ExecutionContext {
    const request = {
        method: options.method,
        user: options.userId
            ? { id: options.userId, email: "user@example.test", role: "STUDENT" }
            : undefined,
    };
    return {
        getType: () => "http",
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => function handler() {},
        getClass: () => class Controller {},
    } as never;
}
