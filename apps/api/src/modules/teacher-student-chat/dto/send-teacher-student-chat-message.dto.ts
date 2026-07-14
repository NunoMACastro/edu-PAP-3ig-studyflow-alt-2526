/**
 * Define contratos de dados recebidos pelo chat professor-aluno por disciplina.
 */
import { IsString, MaxLength, MinLength } from "class-validator";

/**
 * Payload enviado pelo cliente WebSocket para criar uma mensagem.
 */
export class SendTeacherStudentChatMessageDto {
    @IsString()
    @MinLength(1)
    @MaxLength(4000)
    text!: string;
}
