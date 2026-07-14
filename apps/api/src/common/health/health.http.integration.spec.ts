/**
 * Prova HTTP real dos contratos live/ready quando uma dependência deixa de
 * responder. A instância escuta apenas numa porta efémera de loopback.
 */
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { AddressInfo } from "node:net";
import { HealthController } from "./health.controller.js";
import { HealthService } from "./health.service.js";

describe("HealthController — integração HTTP negativa", () => {
    let app: INestApplication;
    let baseUrl: string;

    beforeAll(async () => {
        const healthService = new HealthService(
            { db: { command: jest.fn().mockResolvedValue({ ok: 1 }) } } as never,
            { ping: jest.fn().mockRejectedValue(new Error("redis indisponível")) } as never,
            { checkReady: jest.fn().mockResolvedValue(undefined) } as never,
            { checkReady: jest.fn().mockResolvedValue(undefined) } as never,
            { checkReady: jest.fn().mockResolvedValue(undefined) } as never,
            { checkReady: jest.fn().mockResolvedValue(undefined) } as never,
        );
        const moduleRef = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [{ provide: HealthService, useValue: healthService }],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.listen(0, "127.0.0.1");
        const address = app.getHttpServer().address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
    });

    afterAll(async () => {
        await app?.close();
    });

    it("mantém liveness 200 e readiness fail-closed 503", async () => {
        const live = await fetch(`${baseUrl}/api/health/live`);
        expect(live.status).toBe(200);
        await expect(live.json()).resolves.toMatchObject({
            service: "studyflow-api",
            status: "ok",
        });

        const ready = await fetch(`${baseUrl}/api/health/ready`);
        expect(ready.status).toBe(503);
        await expect(ready.json()).resolves.toMatchObject({
            service: "studyflow-api",
            status: "not_ready",
            failed: ["redis"],
        });
    });

    it("mantém o alias /api/health igualmente fail-closed", async () => {
        const response = await fetch(`${baseUrl}/api/health`);
        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toMatchObject({
            service: "studyflow-api",
            status: "not_ready",
            failed: ["redis"],
        });
    });
});
