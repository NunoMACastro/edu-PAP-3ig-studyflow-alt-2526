// apps/api/src/modules/ai/dto/create-quiz-job.dto.ts
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Pedido para iniciar um quiz em background.
 *
 * O frontend pode sugerir um tópico, mas não escolhe fontes nem envia userId.
 */
export class CreateQuizJobDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}