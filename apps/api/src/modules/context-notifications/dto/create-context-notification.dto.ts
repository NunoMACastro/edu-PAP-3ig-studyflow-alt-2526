/**
 * Define payloads de notificações internas por contexto.
 */
import { IsIn, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import {
    ContextNotificationContextType,
    ContextNotificationType,
} from "../schemas/context-notification.schema.js";

/**
 * Payload para criar notificação contextual.
 */
export class CreateContextNotificationDto {
    @IsIn(["CLASS", "GROUP"])
    contextType!: ContextNotificationContextType;

    @IsMongoId()
    contextId!: string;

    @IsIn(["NEW_MATERIAL", "FEEDBACK", "TASK", "FOLLOW_UP"])
    type!: ContextNotificationType;

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    body!: string;
}
