/**
 * Define contratos de dados usados nas entradas e saídas de materials.
 */
import { MaterialStatus, MaterialType } from "../schemas/material.schema.js";

/**
 * Contrato público de material devolvido ao frontend.
 */
export type PublicMaterialDto = {
    _id: string;
    title: string;
    type: MaterialType;
    status: MaterialStatus;
    url?: string;
    originalName?: string;
    sizeBytes?: number;
    contentRevision?: number;
    createdAt?: Date;
    updatedAt?: Date;
};

/** Contrato de detalhe usado apenas depois de validar ownership da área. */
export type PrivateMaterialDetailDto = PublicMaterialDto & {
    markdownSource?: string;
};
