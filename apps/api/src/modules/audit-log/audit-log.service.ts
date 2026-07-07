/**
 * Implementa auditoria aplicacional com metadata minimizada e logs estruturados.
 */
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StructuredEventService } from "../../common/observability/structured-event.service.js";
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
     * Recebe as dependências injetadas de AuditLogService para manter auditoria administrativa testável e separado de detalhes externos.
     *
     * @param auditModel Modelo de persistência usado para ler e gravar documentos deste domínio.
     * @param structuredEventService Service injetado para reutilizar regras de domínio sem duplicar lógica.
     */
    constructor(
        @InjectModel(AuditEvent.name)
        private readonly auditModel: Model<AuditEventDocument>,
        private readonly structuredEventService: StructuredEventService,
    ) {}

    /**
     * Regista um evento com metadata redigida.
     *
     * @param input Evento a persistir.
     * @returns Evento público persistido.
     */
    async record(input: AuditRecordInput) {
        const resourceType = input.resourceType.trim();
        const resourceId = input.resourceId?.trim();
        const structuredEvent = this.structuredEventService.record({
            correlationId: `${input.domain}:${resourceType}:${resourceId ?? "sem-recurso"}`,
            domain: input.domain,
            action: input.action,
            result: input.result,
            metadata: {
                ...input.metadata,
                resourceType,
                resourceId: resourceId ?? "sem-recurso",
            },
        });

        const event = await this.auditModel.create({
            actorId: new Types.ObjectId(input.actorId),
            domain: structuredEvent.domain,
            action: structuredEvent.action,
            resourceType,
            resourceId,
            result: structuredEvent.result,
            // A segunda redacção mantém o audit log como última barreira antes da BD.
            metadata: this.redactMetadata({
                correlationId: structuredEvent.correlationId,
                observedAt: structuredEvent.at,
                ...structuredEvent.metadata,
            }),
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
     * Valida a regra de auditoria administrativa e lança uma exceção explícita quando o utilizador ou recurso não cumpre o contrato.
     *
     * @param actor Utilizador autenticado usado para validar permissões, ownership e âmbito da operação.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
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
     * Transforma o documento interno de auditoria administrativa num contrato público, removendo detalhes de persistência antes de responder à UI.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Contrato público pronto para a UI, sem campos internos de persistência.
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
