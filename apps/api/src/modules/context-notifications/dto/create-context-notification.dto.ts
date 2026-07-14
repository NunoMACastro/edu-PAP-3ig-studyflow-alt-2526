/**
 * Define payloads de notificações internas por contexto.
 */
import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import {
    CONTEXT_NOTIFICATION_TYPES,
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

    @IsIn(CONTEXT_NOTIFICATION_TYPES)
    type!: ContextNotificationType;

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    body!: string;

    @IsOptional()
    @IsIn(["TODAY", "CLASS_SUBJECTS", "CLASS_POSTS", "CLASS_PROJECTS"])
    destination?: "TODAY" | "CLASS_SUBJECTS" | "CLASS_POSTS" | "CLASS_PROJECTS";
}
