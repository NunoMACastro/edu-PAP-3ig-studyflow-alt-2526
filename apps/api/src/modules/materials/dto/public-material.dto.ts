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
    sizeBytes?: number;
    createdAt?: Date;
};

