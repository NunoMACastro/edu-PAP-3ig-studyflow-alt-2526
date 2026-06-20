// api/src/modules/external-material-imports/dto/import-external-material.dto.ts
import { IsEnum, IsString, IsUrl, Length } from "class-validator";

/** Origem externa permitida para a importação unidirecional de materiais StudyFlow. */
export enum ExternalMaterialProvider {
    GoogleDrive = "GOOGLE_DRIVE",
    OneDrive = "ONE_DRIVE",
}

/** Destino interno onde o link externo ficará registado como material. */
export enum ExternalMaterialTargetType {
    PrivateStudyArea = "PRIVATE_STUDY_AREA",
    OfficialSubject = "OFFICIAL_SUBJECT",
}

/**
 * Dados recebidos pelo endpoint RF61.
 *
 * O utilizador autenticado vem da sessão, por isso este DTO nunca aceita
 * `userId`, role ou campos de ownership enviados pelo browser.
 */
export class ImportExternalMaterialDto {
    /** Provider declarado pelo utilizador para explicar a origem do link. */
    @IsEnum(ExternalMaterialProvider)
    provider!: ExternalMaterialProvider;

    /** Tipo de destino interno escolhido pelo utilizador. */
    @IsEnum(ExternalMaterialTargetType)
    targetType!: ExternalMaterialTargetType;

    /** Identificador da área de estudo privada ou da disciplina oficial. */
    @IsString()
    @Length(12, 80)
    targetId!: string;

    /** Título visível na lista de materiais StudyFlow. */
    @IsString()
    @Length(3, 120)
    title!: string;

    /** URL externo guardado como referência, sem credenciais do provider. */
    @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
    sourceUrl!: string;
}