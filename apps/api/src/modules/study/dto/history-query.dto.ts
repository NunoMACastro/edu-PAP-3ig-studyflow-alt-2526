/**
 * Define contratos de dados usados nas entradas e saídas de study.
 */
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export const DEFAULT_HISTORY_LIMIT = 50;
export const MAX_HISTORY_LIMIT = 50;

/**
 * Query parameters aceites pelo histórico de estudo MF0.
 */
export class HistoryQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(MAX_HISTORY_LIMIT)
    limit?: number;
}
