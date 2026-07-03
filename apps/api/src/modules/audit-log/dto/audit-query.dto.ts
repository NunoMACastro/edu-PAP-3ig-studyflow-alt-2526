/**
 * Define filtros permitidos para consulta de auditoria.
 */
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { AuditDomain, AuditResult } from "../schemas/audit-event.schema.js";

/**
 * Query string de listagem de eventos de auditoria.
 */
export class AuditQueryDto {
    @IsOptional()
    @IsEnum(["MATERIALS", "AI", "ROLES", "PRIVACY", "NOTIFICATIONS", "ADMIN"])
    domain?: AuditDomain;

    @IsOptional()
    @IsEnum(["SUCCESS", "DENIED", "FAILED"])
    result?: AuditResult;

    @IsOptional()
    @IsString()
    @MaxLength(80)
    action?: string;
}
