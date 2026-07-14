/**
 * Define o payload permitido para iniciar geração de quiz em background.
 */
import { IsOptional, IsString, MaxLength } from "class-validator";

/**
 * Pedido para iniciar um quiz em background.
 */
export class CreateQuizJobDto {
    /**
     * Tópico opcional sugerido pelo aluno; fontes e ownership continuam decididos no backend.
     */
    @IsOptional()
    @IsString()
    @MaxLength(120)
    topic?: string;
}
