/**
 * Implementa auditoria aplicacional com metadata minimizada.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditQueryDto } from "./dto/audit-query.dto.js";
import {
    AuditDomain,
    AuditEvent,
    AuditEventDocument,
    AuditResult,
} from "./schemas/audit-event.schema.js";

export type AuditRecordInput = {
    actorId: string;
    domain: AuditDomain;
    action: string;
    resourceType: string;
    resourceId?: string;
    result: AuditResult;
    metadata?: Record<string, unknown>;
};

const SENSITIVE_KEYS = [
    "password",
    "passwordHash",
    "cookie",
    "token",
    "secret",
    "prompt",
    "answer",
    "response",
    "apiKey",
];

/**
 * Serviço de audit log transversal.
 */
@Injectable()
export class AuditLogService {
    /**
     * @param auditModel Modelo Mongoose de eventos de auditoria.
     */
    constructor(
        @InjectModel(AuditEvent.name)
        private readonly auditModel: Model<AuditEventDocument>,
    ) {}

    /**
     * Regista um evento com metadata redigida.
     *
     * @param input Evento a persistir.
     * @returns Evento público persistido.
     */
    async record(input: AuditRecordInput) {
        const event = await this.auditModel.create({
            actorId: new Types.ObjectId(input.actorId),
            domain: input.domain,
            action: input.action.trim(),
            resourceType: input.resourceType.trim(),
            resourceId: input.resourceId,
            result: input.result,
            metadata: this.redactMetadata(input.metadata ?? {}),
        });
        return this.toView(event.toObject());
    }

    /**
     * Lista eventos apenas para administradores.
     *
     * @param actor Utilizador autenticado.
     * @param query Filtros opcionais.
     * @returns Eventos recentes.
     */
    async list(actor: AuthenticatedUser, query: AuditQueryDto = {}) {
        this.assertAdmin(actor);
        const filter: Record<string, unknown> = {};
        if (query.domain) filter.domain = query.domain;
        if (query.result) filter.result = query.result;
        if (query.action) filter.action = query.action.trim();
        const events = await this.auditModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        return events.map((event) => this.toView(event));
    }

    /**
     * Remove chaves sensíveis sem destruir contexto técnico útil.
     *
     * @param metadata Metadata candidata.
     * @returns Metadata segura para persistência.
     */
    redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
        const redacted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(metadata)) {
            const lowered = key.toLowerCase();
            if (SENSITIVE_KEYS.some((sensitive) => lowered.includes(sensitive.toLowerCase()))) {
                redacted[key] = "[REDACTED]";
                continue;
            }
            redacted[key] =
                typeof value === "string" && value.length > 300
                    ? `${value.slice(0, 300)}...`
                    : value;
        }
        return redacted;
    }

    /**
     * @param actor Utilizador autenticado.
     */
    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({
                code: "ADMIN_ROLE_REQUIRED",
                message: "Esta funcionalidade é exclusiva de administradores.",
            });
        }
    }

    /**
     * @param event Documento interno.
     * @returns Contrato público.
     */
    private toView(event: {
        _id?: unknown;
        actorId: unknown;
        domain: AuditDomain;
        action: string;
        resourceType: string;
        resourceId?: string;
        result: AuditResult;
        metadata?: Record<string, unknown>;
        createdAt?: Date;
    }) {
        return {
            id: String(event._id),
            actorId: String(event.actorId),
            domain: event.domain,
            action: event.action,
            resourceType: event.resourceType,
            resourceId: event.resourceId,
            result: event.result,
            metadata: event.metadata ?? {},
            createdAt: event.createdAt,
        };
    }
}
