// apps/api/src/modules/notification-policies/dto/upsert-notification-policy.dto.ts
import { IsBoolean, IsEnum, IsInt, Max, Min } from "class-validator";

export enum NotificationChannel {
    IN_APP = "IN_APP",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
}

/**
 * Configuração administrativa para um canal de notificação.
 */
export class UpsertNotificationPolicyDto {
    @IsEnum(NotificationChannel)
    channel!: NotificationChannel;

    /** Permite desligar canais sem apagar histórico ou preferências pessoais. */
    @IsBoolean()
    enabled!: boolean;

    @IsInt()
    @Min(1)
    @Max(200)
    maxPerUserPerDay!: number;

    @IsInt()
    @Min(1)
    @Max(500)
    maxPerTargetPerHour!: number;
}