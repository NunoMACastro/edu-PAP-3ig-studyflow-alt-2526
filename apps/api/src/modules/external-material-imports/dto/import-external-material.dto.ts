/**
 * Define o contrato RF61 para importacao unidirecional de links externos.
 */
import { IsEnum, IsString, IsUrl, Length } from "class-validator";

/**
 * Providers externos aceites pela importacao unidirecional StudyFlow.
 */
export enum ExternalMaterialProvider {
    GoogleDrive = "GOOGLE_DRIVE",
    OneDrive = "ONE_DRIVE",
}

/**
 * Destinos internos onde o link externo pode ficar registado.
 */
export enum ExternalMaterialTargetType {
    PrivateStudyArea = "PRIVATE_STUDY_AREA",
    OfficialSubject = "OFFICIAL_SUBJECT",
}

/**
 * Payload do endpoint `POST /api/external-material-imports`.
 *
 * O utilizador autenticado vem do `SessionGuard`; este DTO nunca aceita
 * `userId`, role, ownership ou permissao enviados pelo frontend.
 */
export class ImportExternalMaterialDto {
    @IsEnum(ExternalMaterialProvider)
    provider!: ExternalMaterialProvider;

    @IsEnum(ExternalMaterialTargetType)
    targetType!: ExternalMaterialTargetType;

    @IsString()
    @Length(12, 80)
    targetId!: string;

    @IsString()
    @Length(3, 120)
    title!: string;

    @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
    sourceUrl!: string;
}
