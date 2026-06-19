// apps/api/src/modules/audit-log/dto/audit-query.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export enum AuditDomain {
    MATERIAL = "MATERIAL",
    AI = "AI",
    ROLE = "ROLE",
}

export enum AuditResult {
    SUCCESS = "SUCCESS",
    DENIED = "DENIED",
    FAILED = "FAILED",
}

/**
 * Filtros administrativos para consulta de auditoria.
 */
export class AuditQueryDto {
    @IsOptional()
    @IsEnum(AuditDomain)
    domain?: AuditDomain;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    action?: string;
}