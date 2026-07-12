/** Testes do limite de upload executado antes do parser multipart. */
import { ExecutionContext, HttpException } from "@nestjs/common";
import { createInMemorySessionStore } from "../auth/session-store.js";
import { MaterialUploadRateLimitGuard } from "./material-upload-rate-limit.guard.js";

const userId = "507f1f77bcf86cd799439012";

describe("MaterialUploadRateLimitGuard", () => {
    it("aceita vinte tentativas por hora e bloqueia a seguinte", async () => {
        const guard = new MaterialUploadRateLimitGuard(
            createInMemorySessionStore(),
        );
        const context = makeContext(userId);

        for (let attempt = 0; attempt < 20; attempt += 1) {
            await expect(guard.canActivate(context)).resolves.toBe(true);
        }
        await expect(guard.canActivate(context)).rejects.toMatchObject({
            status: 429,
            response: expect.objectContaining({
                code: "MATERIAL_UPLOAD_RATE_LIMITED",
            }),
        });
    });

    it("falha antes de tocar no Redis se a sessão não tiver actor", async () => {
        const redis = createInMemorySessionStore();
        const incr = jest.spyOn(redis, "incr");
        const guard = new MaterialUploadRateLimitGuard(redis);

        await expect(guard.canActivate(makeContext(undefined))).rejects.toBeInstanceOf(
            HttpException,
        );
        expect(incr).not.toHaveBeenCalled();
    });
});

function makeContext(id: string | undefined): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({
                user: id
                    ? { id, email: "aluno@studyflow.test", role: "STUDENT" }
                    : undefined,
            }),
        }),
    } as ExecutionContext;
}
