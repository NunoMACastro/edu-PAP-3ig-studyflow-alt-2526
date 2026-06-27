/**
 * Define contratos de dados usados nas entradas e saídas de salas de estudo.
 */
import {
    IsIn,
    IsMongoId,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateIf,
} from "class-validator";

/**
 * Dados de criação de partilha na sala.
 */
export class CreateRoomShareDto {
    @IsIn(["NOTE", "URL", "MATERIAL_REF"])
    type!: "NOTE" | "URL" | "MATERIAL_REF";

    @IsString()
    @MinLength(2)
    @MaxLength(160)
    title!: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "NOTE")
    @IsString()
    @MinLength(2)
    @MaxLength(10000)
    textContent?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "URL")
    @IsUrl({ protocols: ["http", "https"], require_protocol: true })
    url?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10000)
    copiedText?: string;

    @ValidateIf((body: CreateRoomShareDto) => body.type === "MATERIAL_REF")
    @IsMongoId()
    materialId?: string;
}
