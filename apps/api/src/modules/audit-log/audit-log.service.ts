// apps/api/src/modules/audit-log/audit-log.service.ts
import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { AuditDomain, AuditQueryDto, AuditResult } from "./dto/audit-query.dto.js";
import { AuditEvent, AuditEventDocument } from "./schemas/audit-event.schema.js";

export type RecordAuditEventInput = {
    actorId: string;
    domain: AuditDomain;
    action: string;
    resourceType: string;
    resourceId?: string;
    result: AuditResult;
    metadata?: Record<string, string | number | boolean>;
};

/**
 * Serviço central de auditoria com minimização de metadados.
 */
@Injectable()
export class AuditLogService {
    private readonly blockedMetadataKeys = new Set(["password", "passwordHash", "token", "cookie", "prompt", "answer"]);

    constructor(
        @InjectModel(AuditEvent.name)
        private readonly auditModel: Model<AuditEventDocument>,
    ) {}

    async record(input: RecordAuditEventInput): Promise<void> {
        await this.auditModel.create({
            actorId: new Types.ObjectId(input.actorId),
            domain: input.domain,
            action: input.action,
            resourceType: input.resourceType,
            resourceId: input.resourceId,
            result: input.result,
            metadata: this.redactMetadata(input.metadata ?? {}),
        });
    }

    async list(actor: AuthenticatedUser, query: AuditQueryDto) {
        this.assertAdmin(actor);
        const filter: Record<string, string> = {};
        if (query.domain) filter.domain = query.domain;
        if (query.action) filter.action = query.action;
        return this.auditModel.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    }

    private redactMetadata(metadata: Record<string, string | number | boolean>) {
        return Object.fromEntries(
            Object.entries(metadata).filter(([key]) => !this.blockedMetadataKeys.has(key)),
        );
    }

    private assertAdmin(actor: AuthenticatedUser): void {
        if (actor.role !== "ADMIN") {
            throw new ForbiddenException({ code: "ADMIN_ROLE_REQUIRED", message: "Apenas administradores podem consultar auditoria." });
        }
    }
}