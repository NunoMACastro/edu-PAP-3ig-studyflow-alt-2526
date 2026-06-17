// apps/api/src/modules/context-notifications/dto/create-context-notification.dto.ts
import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export enum ContextNotificationTargetType {
    CLASS = "CLASS",
    GROUP = "GROUP",
}

export enum ContextNotificationEventType {
    MATERIAL_CREATED = "MATERIAL_CREATED",
    FEEDBACK_POSTED = "FEEDBACK_POSTED",
    TASK_ASSIGNED = "TASK_ASSIGNED",
}

/**
 * Entrada validada para criar uma notificação de contexto.
 */
export class CreateContextNotificationDto {
    /** O alvo decide que service de ownership ou membership será usado. */
    @IsEnum(ContextNotificationTargetType)
    targetType!: ContextNotificationTargetType;

    @IsMongoId()
    targetId!: string;

    /** O evento evita strings livres impossíveis de validar em testes. */
    @IsEnum(ContextNotificationEventType)
    eventType!: ContextNotificationEventType;

    @IsString()
    @MinLength(3)
    @MaxLength(120)
    title!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(500)
    body!: string;

    @IsOptional()
    @IsMongoId()
    sourceId?: string;
}