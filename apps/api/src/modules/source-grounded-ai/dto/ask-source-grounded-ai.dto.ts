// apps/api/src/modules/source-grounded-ai/dto/ask-source-grounded-ai.dto.ts
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsMongoId,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

/**
 * Pedido para resposta baseada exclusivamente em jobs de indexação autorizados.
 */
export class AskSourceGroundedAiDto {
    /**
     * Jobs `DONE` produzidos pela indexação de materiais.
     */
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(8)
    @IsMongoId({ each: true })
    sourceJobIds!: string[];

    /**
     * Pergunta do aluno ou professor sobre a fonte indexada.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(800)
    question!: string;
}