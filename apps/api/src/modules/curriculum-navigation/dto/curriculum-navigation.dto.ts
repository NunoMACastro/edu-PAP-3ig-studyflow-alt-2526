/**
 * Define contratos de dados usados nas entradas e saídas de navegação curricular.
 */
import { ArrayMinSize, IsArray, IsMongoId } from "class-validator";

/**
 * Pedido de navegação curricular sobre jobs autorizados.
 */
export class CurriculumNavigationDto {
    /**
     * Jobs indexados usados para construir tópicos e secções.
     */
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    jobIds!: string[];
}
