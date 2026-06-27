/**
 * Define payload administrativo de política de notificação.
 */
import { IsBoolean, IsInt, Max, Min } from "class-validator";

/**
 * Dados editáveis de uma política de canal.
 */
export class UpsertNotificationPolicyDto {
    @IsBoolean()
    enabled!: boolean;

    @IsInt()
    @Min(1)
    @Max(200)
    maxPerUserPerDay!: number;

    @IsInt()
    @Min(1)
    @Max(200)
    maxPerContextPerHour!: number;
}
