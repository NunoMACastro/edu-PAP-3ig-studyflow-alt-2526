/**
 * Define contratos de dados usados nas entradas e saídas de mensagens de grupos de estudo.
 */
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

/**
 * Contrato de mensagens do grupo de estudo que documenta a estrutura esperada em tempo de desenvolvimento.
 */
export type StudyGroupMessageKind = "MESSAGE" | "NOTE";

/**
 * Dados para mensagem ou nota coletiva no grupo.
 */
export class CreateStudyGroupMessageDto {
    /**
     * Tipo de conteúdo colaborativo.
     */
    @IsIn(["MESSAGE", "NOTE"])
    kind!: StudyGroupMessageKind;

    /**
     * Texto curto de chat ou nota coletiva.
     */
    @IsString()
    @MinLength(1)
    @MaxLength(4000)
    text!: string;
}
