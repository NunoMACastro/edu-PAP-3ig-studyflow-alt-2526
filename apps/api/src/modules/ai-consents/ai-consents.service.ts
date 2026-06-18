// apps/api/src/modules/ai-consents/ai-consents.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AiConsentPurpose, UpsertAiConsentDto } from "./dto/upsert-ai-consent.dto.js";
import { AiConsent, AiConsentDocument } from "./schemas/ai-consent.schema.js";

export type AiConsentView = { purpose: AiConsentPurpose; policyVersion: string; status: string; decidedAt: Date };

/**
 * Serviço de consentimentos IA com bloqueio centralizado.
 */
@Injectable()
export class AiConsentsService {
    constructor(
        @InjectModel(AiConsent.name)
        private readonly consentModel: Model<AiConsentDocument>,
    ) {}

    async listMine(actor: AuthenticatedUser): Promise<AiConsentView[]> {
        const rows = await this.consentModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ decidedAt: -1 })
            .lean();
        return rows.map((row) => this.toView(row));
    }

    async grant(actor: AuthenticatedUser, input: UpsertAiConsentDto): Promise<AiConsentView> {
        const row = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            purpose: input.purpose,
            policyVersion: input.policyVersion,
            status: "GRANTED",
            decidedAt: new Date(),
        });
        return this.toView(row.toObject());
    }

    async revoke(actor: AuthenticatedUser, purpose: AiConsentPurpose): Promise<AiConsentView> {
        const row = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            purpose,
            policyVersion: "revoked",
            status: "REVOKED",
            decidedAt: new Date(),
        });
        return this.toView(row.toObject());
    }

    /**
     * Bloqueia qualquer chamada IA sem consentimento activo para a finalidade.
     */
    async assertGranted(userId: string, purpose: AiConsentPurpose): Promise<void> {
        const latest = await this.consentModel
            .findOne({ userId: new Types.ObjectId(userId), purpose })
            .sort({ decidedAt: -1 })
            .lean();
        if (latest?.status !== "GRANTED") {
            throw new ForbiddenException({ code: "AI_CONSENT_REQUIRED", message: "É necessário consentimento activo para usar esta funcionalidade de IA." });
        }
    }

    private toView(row: { purpose: AiConsentPurpose; policyVersion: string; status: string; decidedAt: Date }): AiConsentView {
        return { purpose: row.purpose, policyVersion: row.policyVersion, status: row.status, decidedAt: row.decidedAt };
    }
}