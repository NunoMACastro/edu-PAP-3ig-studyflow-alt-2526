// apps/api/src/modules/ai-consents/ai-consents.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import {
    AiConsentPurpose,
    UpsertAiConsentDto,
} from "./dto/upsert-ai-consent.dto.js";
import { AiConsent, AiConsentDocument } from "./schemas/ai-consent.schema.js";

export type AiConsentView = {
    purpose: AiConsentPurpose;
    policyVersion: string;
    status: string;
    decidedAt: Date;
};

/**
 * Serviço de consentimentos IA com bloqueio centralizado.
 */
@Injectable()
export class AiConsentsService {
    constructor(
        @InjectModel(AiConsent.name)
        private readonly consentModel: Model<AiConsentDocument>,
    ) {}

    /**
     * Lista o histórico de consentimentos do utilizador autenticado.
     *
     * @param actor Utilizador autenticado pela sessão.
     * @returns Decisões ordenadas da mais recente para a mais antiga.
     */
    async listMine(actor: AuthenticatedUser): Promise<AiConsentView[]> {
        // O filtro usa actor.id da sessão para impedir listagem de consentimentos de outro utilizador.
        const rows = await this.consentModel
            .find({ userId: new Types.ObjectId(actor.id) })
            .sort({ decidedAt: -1 })
            .lean();
        return rows.map((row) => this.toView(row));
    }

    /**
     * Regista uma nova concessão de consentimento IA.
     *
     * @param actor Utilizador autenticado que concede a finalidade.
     * @param input Finalidade e versão de política aceites pelo utilizador.
     * @returns Decisão criada em formato público.
     */
    async grant(
        actor: AuthenticatedUser,
        input: UpsertAiConsentDto,
    ): Promise<AiConsentView> {
        // Cada decisão é append-only para preservar histórico e permitir auditoria posterior.
        const row = await this.consentModel.create({
            userId: new Types.ObjectId(actor.id),
            purpose: input.purpose,
            policyVersion: input.policyVersion,
            status: "GRANTED",
            decidedAt: new Date(),
        });
        return this.toView(row.toObject());
    }

    /**
     * Regista uma revogação sem apagar decisões anteriores.
     *
     * @param actor Utilizador autenticado que revoga a finalidade.
     * @param purpose Finalidade IA a bloquear daqui para a frente.
     * @returns Decisão criada em estado `REVOKED`.
     */
    async revoke(
        actor: AuthenticatedUser,
        purpose: AiConsentPurpose,
    ): Promise<AiConsentView> {
        // Revogar cria um novo registo para que o último estado seja bloqueante e rastreável.
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
    async assertGranted(
        userId: string,
        purpose: AiConsentPurpose,
    ): Promise<void> {
        // Só a decisão mais recente interessa para saber se o consentimento está activo.
        const latest = await this.consentModel
            .findOne({ userId: new Types.ObjectId(userId), purpose })
            .sort({ decidedAt: -1 })
            .lean();
        if (latest?.status !== "GRANTED") {
            throw new ForbiddenException({
                code: "AI_CONSENT_REQUIRED",
                message:
                    "É necessário consentimento activo para usar esta funcionalidade de IA.",
            });
        }
    }

    /**
     * Converte o documento interno para o contrato público do módulo.
     *
     * @param row Documento ou objecto Mongoose já materializado.
     * @returns Vista sem `_id`, `userId` ou outros detalhes internos.
     */
    private toView(row: {
        purpose: AiConsentPurpose;
        policyVersion: string;
        status: string;
        decidedAt: Date;
    }): AiConsentView {
        return {
            purpose: row.purpose,
            policyVersion: row.policyVersion,
            status: row.status,
            decidedAt: row.decidedAt,
        };
    }
}