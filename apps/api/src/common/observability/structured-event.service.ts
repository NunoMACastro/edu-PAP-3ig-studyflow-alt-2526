/**
 * Normaliza eventos operacionais StudyFlow para logs estruturados, seguros e
 * pesquisáveis.
 */
import { Injectable } from "@nestjs/common";
import {
    AuditDomain,
    AuditResult,
} from "../../modules/audit-log/schemas/audit-event.schema.js";
import { redactMetadataRecursively } from "./redact-metadata.js";

/**
 * Entrada mínima para um evento operacional emitido por um módulo da API.
 */
export type StructuredEventInput = {
    correlationId: string;
    domain: AuditDomain;
    action: string;
    result: AuditResult;
    metadata?: Record<string, unknown>;
};

/**
 * Evento normalizado pronto para logger interno ou audit log.
 */
export type StructuredEventOutput = {
    at: string;
    correlationId: string;
    domain: AuditDomain;
    action: string;
    result: AuditResult;
    metadata: Record<string, unknown>;
};


/**
 * Service transversal de observabilidade operacional.
 */
@Injectable()
export class StructuredEventService {
    /**
     * Converte um evento de domínio num objeto seguro para auditoria técnica.
     *
     * @param input Evento emitido por um módulo da API.
     * @returns Evento normalizado sem valores sensíveis.
     * @throws Error quando a correlação ou a ação não têm valor útil.
     */
    record(input: StructuredEventInput): StructuredEventOutput {
        const correlationId = input.correlationId.trim();
        const action = input.action.trim();

        if (!correlationId) {
            throw new Error("correlationId e obrigatorio para logs estruturados.");
        }

        if (!action) {
            throw new Error("action e obrigatoria para logs estruturados.");
        }

        // Usar AuditDomain e AuditResult mantém os eventos compatíveis com o audit log existente.
        return {
            at: new Date().toISOString(),
            correlationId,
            domain: input.domain,
            action,
            result: input.result,
            metadata: this.redactMetadata(input.metadata ?? {}),
        };
    }

    /**
     * Remove metadados que podem conter sessão, material privado ou conteúdo de IA.
     *
     * @param metadata Metadados candidatos a observabilidade.
     * @returns Metadados seguros para persistência ou evidence.
     */
    private redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
        return redactMetadataRecursively(metadata);
    }
}
