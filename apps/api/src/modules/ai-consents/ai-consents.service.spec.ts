// apps/api/src/modules/ai-consents/ai-consents.service.spec.ts
import { ForbiddenException } from "@nestjs/common";
import { AiConsentsService } from "./ai-consents.service.js";
import { AiConsentPurpose } from "./dto/upsert-ai-consent.dto.js";
import type { Model } from "mongoose";
import type { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import type { AiConsentDocument } from "./schemas/ai-consent.schema.js";

describe("AiConsentsService", () => {
    const actor: AuthenticatedUser = {
        id: "507f1f77bcf86cd799439010",
        email: "aluno@studyflow.local",
        role: "STUDENT",
    };

    it("bloqueia IA sem consentimento activo", async () => {
        const { service } = makeService(null);

        await expect(
            service.assertGranted(
                actor.id,
                AiConsentPurpose.PRIVATE_AREA_AI,
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it("permite IA quando o último consentimento está concedido", async () => {
        const { service } = makeService({
            purpose: AiConsentPurpose.PRIVATE_AREA_AI,
            policyVersion: "2026-06-16",
            status: "GRANTED",
            decidedAt: new Date("2026-06-16T10:00:00.000Z"),
        });

        await expect(
            service.assertGranted(
                actor.id,
                AiConsentPurpose.PRIVATE_AREA_AI,
            ),
        ).resolves.toBeUndefined();
    });

    it("bloqueia IA quando o último consentimento está revogado", async () => {
        const { service } = makeService({
            purpose: AiConsentPurpose.PRIVATE_AREA_AI,
            policyVersion: "revoked",
            status: "REVOKED",
            decidedAt: new Date("2026-06-17T10:00:00.000Z"),
        });

        await expect(
            service.assertGranted(
                actor.id,
                AiConsentPurpose.PRIVATE_AREA_AI,
            ),
        ).rejects.toMatchObject({
            response: expect.objectContaining({ code: "AI_CONSENT_REQUIRED" }),
        });
    });

    it("regista concessão e revogação como decisões novas", async () => {
        const createdRows = [
            {
                toObject: () => ({
                    purpose: AiConsentPurpose.PROJECT_AI,
                    policyVersion: "2026-06-16",
                    status: "GRANTED",
                    decidedAt: new Date("2026-06-16T10:00:00.000Z"),
                }),
            },
            {
                toObject: () => ({
                    purpose: AiConsentPurpose.PROJECT_AI,
                    policyVersion: "revoked",
                    status: "REVOKED",
                    decidedAt: new Date("2026-06-17T10:00:00.000Z"),
                }),
            },
        ];
        const { consentModel, service } = makeService(null);
        consentModel.create
            .mockResolvedValueOnce(createdRows[0])
            .mockResolvedValueOnce(createdRows[1]);

        await expect(
            service.grant(actor, {
                purpose: AiConsentPurpose.PROJECT_AI,
                policyVersion: "2026-06-16",
            }),
        ).resolves.toMatchObject({ status: "GRANTED" });

        await expect(
            service.revoke(actor, AiConsentPurpose.PROJECT_AI),
        ).resolves.toMatchObject({ status: "REVOKED" });

        expect(consentModel.create).toHaveBeenCalledTimes(2);
    });
});

type ConsentModelDouble = {
    create: jest.Mock;
    findOne: jest.Mock;
};

function makeService(latestConsent: unknown) {
    const consentModel: ConsentModelDouble = {
        create: jest.fn(),
        findOne: jest.fn(() => ({
            sort: jest.fn(() => ({
                lean: jest.fn().mockResolvedValue(latestConsent),
            })),
        })),
    };
    const service = new AiConsentsService(
        consentModel as unknown as Model<AiConsentDocument>,
    );
    return { consentModel, service };
}