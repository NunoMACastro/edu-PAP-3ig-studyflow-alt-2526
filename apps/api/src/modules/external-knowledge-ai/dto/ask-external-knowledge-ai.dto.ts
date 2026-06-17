/**
 * Define contratos de dados usados nas entradas e saídas de IA com conhecimento externo limitado.
 */
import { IsBoolean, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Pedido de IA com opção explícita de conhecimento externo limitado.
 */
export class AskExternalKnowledgeAiDto {
    /**
     * Área privada que fornece ownership e fontes internas.
     */
    @IsMongoId()
    studyAreaId!: string;

    /**
     * Pergunta do aluno.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(1200)
    question!: string;

    /**
     * Permissão explícita para acrescentar nota externa geral.
     */
    @IsBoolean()
    allowExternalKnowledge!: boolean;
}
