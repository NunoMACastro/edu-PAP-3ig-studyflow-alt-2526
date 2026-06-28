// apps/api/src/common/observability/structured-event.service.ts
/**
 * Normaliza eventos operacionais seguros para logs estruturados StudyFlow.
 */
import { Injectable } from "@nestjs/common";
import {
    AuditDomain,
    AuditResult,
} from "../../modules/audit-log/schemas/audit-event.schema.js";

export type StructuredEventInput = {
    correlationId: string;
    domain: AuditDomain;
    action: string;
    result: AuditResult;
    metadata?: Record<string, unknown>;
};

export type StructuredEventOutput = {
    at: string;
    correlationId: string;
    domain: AuditDomain;
    action: string;
    result: AuditResult;
    metadata: Record<string, unknown>;
};

const SENSITIVE_KEYS = ["password", "cookie", "secret", "prompt", "answer", "token"];

/**
 * Service transversal de observabilidade.
 */
@Injectable()
export class StructuredEventService {
    /**
     * Converte um evento de domínio num objeto seguro para logger ou audit log.
     *
     * @param input Evento emitido por um módulo da API.
     * @returns Evento normalizado sem valores sensíveis.
     */
    record(input: StructuredEventInput): StructuredEventOutput {
        // Usar AuditDomain e AuditResult evita estados incompatíveis com o audit log.
        return {
            at: new Date().toISOString(),
            correlationId: input.correlationId.trim(),
            domain: input.domain,
            action: input.action.trim(),
            result: input.result,
            metadata: this.redact(input.metadata ?? {}),
        };
    }

    /**
     * Remove metadados que podem conter sessão, material privado ou conteúdo de IA.
     *
     * @param metadata Metadados candidatos a observabilidade.
     * @returns Metadados seguros para persistência.
     */
    private redact(metadata: Record<string, unknown>): Record<string, unknown> {
        const safe: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(metadata)) {
            const normalizedKey = key.toLowerCase();
            const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
                normalizedKey.includes(sensitiveKey),
            );
            // Redigir por nome de campo evita que prompts e cookies apareçam em evidence.
            safe[key] = isSensitive ? "[REDACTED]" : value;
        }
        return safe;
    }
}