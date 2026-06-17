// apps/api/src/modules/privacy-data-exports/dto/request-data-export.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Pedido opcionalmente anotado pelo próprio utilizador.
 */
export class RequestDataExportDto {
    @IsOptional()
    @IsString()
    @MaxLength(300)
    reason?: string;
}