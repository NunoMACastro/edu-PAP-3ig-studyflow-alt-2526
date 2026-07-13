/**
 * Define contratos de dados usados nas entradas e saídas de preferências de notificação.
 */
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

/**
 * Enumera os valores permitidos para notification context.
 */
export enum NotificationContext {
    STUDY_ROUTINE = "STUDY_ROUTINE",
    STUDY_GOAL = "STUDY_GOAL",
    GROUP_SESSION = "GROUP_SESSION",
    GUIDED_ROOM = "GUIDED_ROOM",
    FOLLOW_UP = "FOLLOW_UP",
    CLASS_UPDATES = "CLASS_UPDATES",
    LEARNING_CONTENT = "LEARNING_CONTENT",
    ASSESSMENT = "ASSESSMENT",
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
    @IsOptional()
    @IsBoolean()
    email?: boolean;

    /**
     * Permissão para push. A integração real não existe nesta fase.
     */
    @IsOptional()
    @IsBoolean()
    push?: boolean;

    /**
     * Permissão para alerta dentro da app.
     */
    @IsBoolean()
    inApp!: boolean;
}
