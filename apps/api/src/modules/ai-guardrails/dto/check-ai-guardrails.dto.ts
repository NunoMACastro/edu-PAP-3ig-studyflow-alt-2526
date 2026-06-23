/**
 * Define contratos de dados usados nas entradas e saídas de ai guardrails.
 */
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Enumera os valores permitidos para ai guardrail context type.
 */
export enum AiGuardrailContextType {
    SOLO = "SOLO",
    STUDY_ROOM = "STUDY_ROOM",
    CLASS_SUBJECT = "CLASS_SUBJECT",
}

/**
 * Dados recebidos pelo endpoint que decide se um pedido de IA pode avançar.
 *
 * O `userId` não existe no DTO porque a fonte de verdade é sempre a sessão
 * autenticada. Isto evita que o frontend consiga simular ownership ou
 * membership de outro aluno.
 */
export class CheckAiGuardrailsDto {
    /**
     * Contexto funcional onde a IA será usada.
     */
    @IsEnum(AiGuardrailContextType)
    contextType!: AiGuardrailContextType;

    /**
     * Área, sala/grupo ou disciplina a validar.
     */
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    resourceId!: string;

    /**
     * Pergunta ou instrução original do aluno.
     */
    @IsString()
    @MinLength(5)
    @MaxLength(2000)
    prompt!: string;
}
