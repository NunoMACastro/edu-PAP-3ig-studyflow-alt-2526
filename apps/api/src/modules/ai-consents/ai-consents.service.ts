/**
 * Implementa consentimentos versionados para funcionalidades IA.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { UpsertAiConsentDto } from "./dto/upsert-ai-consent.dto.js";
import { AiConsent, AiConsentDocument, AiConsentPurpose } from "./schemas/ai-consent.schema.js";

export const CURRENT_AI_POLICY_VERSION = "2026-06-16";

/**
 * Service de consentimentos de IA.
 */
@Injectable()
export class AiConsentsService {
    constructor(
        @InjectModel(AiConsent.name)
        private readonly consentModel: Model<AiConsentDocument>,
        private readonly auditLogService: AuditLogService,
    ) {}

    /**
     * Lista último estado por finalidade.
     *
     * @param actor Utilizador autenticado.
     * @returns Consentimentos efetivos.
     */
    async list(actor: AuthenticatedUser) {
        const consents = await this.consentModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ createdAt: -1 })
            .lean();
        const byPurpose = new Map<AiConsentPurpose, (typeof consents)[number]>();
        for (const consent of consents) {
            if (!byPurpose.has(consent.purpose)) byPurpose.set(consent.purpose, consent);
        }
        return [...byPurpose.values()].map((consent) => this.toView(consent));
    }

    /**
     * Concede consentimento para finalidade.
     *
     * @param actor Utilizador autenticado.
     * @param purpose Finalidade IA.
     * @param input Versão opcional.
     * @returns Consentimento criado.
     */
    async grant(actor: AuthenticatedUser, purpose: AiConsentPurpose, input: UpsertAiConsentDto) {
        const consent = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            actorId: new Types.ObjectId(actor.id),
            purpose,
            status: "GRANTED",
            policyVersion: input.policyVersion ?? CURRENT_AI_POLICY_VERSION,
        });
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "AI_CONSENT_GRANTED",
            resourceType: "AiConsent",
            resourceId: String(consent._id),
            result: "SUCCESS",
            metadata: { purpose, policyVersion: consent.policyVersion },
        });
        return this.toView(consent.toObject());
    }

    /**
     * Revoga consentimento para finalidade.
     *
     * @param actor Utilizador autenticado.
     * @param purpose Finalidade IA.
     * @returns Consentimento criado em estado revogado.
     */
    async revoke(actor: AuthenticatedUser, purpose: AiConsentPurpose) {
        const consent = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            actorId: new Types.ObjectId(actor.id),
            purpose,
            status: "REVOKED",
            policyVersion: CURRENT_AI_POLICY_VERSION,
        });
        await this.auditLogService.record({
            actorId: actor.id,
            domain: "AI",
            action: "AI_CONSENT_REVOKED",
            resourceType: "AiConsent",
            resourceId: String(consent._id),
            result: "SUCCESS",
            metadata: { purpose },
        });
        return this.toView(consent.toObject());
    }

    /**
     * Bloqueia chamadas IA sem consentimento ativo.
     *
     * @param userId Utilizador dono do tratamento.
     * @param purpose Finalidade IA.
     */
    async assertGranted(userId: string, purpose: AiConsentPurpose): Promise<void> {
        const consent = await this.consentModel
            .findOne({ userId: new Types.ObjectId(userId), purpose })
            .sort({ createdAt: -1 })
            .lean();
        if (!consent || consent.status !== "GRANTED") {
            throw new ForbiddenException({
                code: "AI_CONSENT_REQUIRED",
                message: "É necessário consentimento ativo para usar esta funcionalidade de IA.",
            });
        }
    }

    private toView(consent: {
        _id?: unknown;
        userId: unknown;
        purpose: AiConsentPurpose;
        status: "GRANTED" | "REVOKED";
        policyVersion: string;
        createdAt?: Date;
    }) {
        return {
            id: String(consent._id),
            userId: String(consent.userId),
            purpose: consent.purpose,
            status: consent.status,
            policyVersion: consent.policyVersion,
            createdAt: consent.createdAt,
        };
    }
}
