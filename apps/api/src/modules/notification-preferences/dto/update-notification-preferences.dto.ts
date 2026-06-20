/**
 * Define contratos de dados usados nas entradas e saídas de preferências de notificação.
 */
import { IsBoolean, IsEnum } from "class-validator";

/**
 * Enumera os valores permitidos para notification context.
 */
export enum NotificationContext {
    STUDY_ROUTINE = "STUDY_ROUTINE",
    STUDY_GOAL = "STUDY_GOAL",
    GROUP_SESSION = "GROUP_SESSION",
}

/**
 * Preferências de canal para um contexto de notificação.
 */
export class UpdateNotificationPreferencesDto {
    /**
     * Contexto funcional da notificação.
     */
    @IsEnum(NotificationContext)
    context!: NotificationContext;

    /**
     * Permissão para email. A integração real não existe nesta fase.
     */
    @IsBoolean()
    email!: boolean;

    /**
     * Permissão para push. A integração real não existe nesta fase.
     */
    @IsBoolean()
    push!: boolean;

    /**
     * Permissão para alerta dentro da app.
     */
    @IsBoolean()
    inApp!: boolean;
}
