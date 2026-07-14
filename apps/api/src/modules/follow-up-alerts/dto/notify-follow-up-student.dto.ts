/**
 * Define a mensagem mínima para uma notificação individual de acompanhamento.
 */
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * Conteúdo escrito pelo professor para um aluno já validado pela rota e pelo service.
 */
export class NotifyFollowUpStudentDto {
    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    message!: string;
}
