/**
 * Define o payload de pedido de exportação RGPD.
 */
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Payload pequeno para permitir uma nota opcional sem aceitar targetUserId.
 */
export class RequestDataExportDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    note?: string;
}
