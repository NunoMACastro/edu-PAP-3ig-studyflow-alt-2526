/**
 * Define contratos de dados usados nas entradas e saídas de planeamento de projetos com IA.
 */
import {
    ArrayMaxSize,
    IsArray,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from "class-validator";

/**
 * Pedido do aluno para gerar um plano gradual de projecto.
 */
export class CreateProjectAiPlanDto {
    @IsString()
    @MinLength(3)
    @MaxLength(240)
    studentGoal!: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(8)
    @IsString({ each: true })
    knownDifficulties?: string[];
}
