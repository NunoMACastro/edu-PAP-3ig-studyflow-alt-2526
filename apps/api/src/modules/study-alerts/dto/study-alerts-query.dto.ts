/**
 * Define contratos de dados usados nas entradas e saídas de alertas de estudo.
 */
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

/**
 * Query de alertas internos de estudo.
 */
export class StudyAlertsQueryDto {
    /**
     * Quando ativo, mostra apenas alertas futuros.
     */
    @IsOptional()
    @Transform(({ value }) => {
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        return value;
    })
    @IsBoolean()
    onlyUpcoming?: boolean;
}
