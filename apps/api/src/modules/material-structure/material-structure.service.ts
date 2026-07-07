/**
 * Implementa as regras de negócio de material structure e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuthenticatedUser } from "../../common/types/authenticated-request.js";
import { MaterialIndexService } from "../material-index/material-index.service.js";
import {
    MaterialSection,
    MaterialStructure,
    MaterialStructureDocument,
} from "./schemas/material-structure.schema.js";

/**
 * Serviço de extração estrutural a partir de jobs de indexação concluídos.
 */
@Injectable()
export class MaterialStructureService {
    /**
     * Recebe dependências por injeção para manter a classe testável e sem criação manual de services.
     *
     * @param structureModel Modelo Mongoose injetado para ler e persistir estrutura de materiais.
     * @param indexService Service injetado para reutilizar regras de index sem duplicar validações.
     */
    constructor(
        @InjectModel(MaterialStructure.name)
        private readonly structureModel: Model<MaterialStructureDocument>,
        private readonly indexService: MaterialIndexService,
    ) {}

    /**
     * Cria estrutura de materiais depois de validar permissões, normalizar input e preparar o contrato público.
     *
     * @param actor Utilizador autenticado vindo da sessão; é a base para validar role, ownership e membership.
     * @param jobId Identificador do job de indexação; controla que chunks podem ser lidos ou versionados.
     * @returns Registo de estrutura de materiais criado no formato público esperado pela UI ou pelo teste.
     */
    async createFromJob(actor: AuthenticatedUser, jobId: string) {
        const job = await this.indexService.findDoneJob(actor, jobId);
        const sections: MaterialSection[] = job.extractedTextChunks.map((chunk) => ({
            order: chunk.order,
            title: this.deriveTitle(chunk.text, chunk.order),
            summary: chunk.text.slice(0, 240),
            references: [
                {
                    chunkOrder: chunk.order,
                    sourceLabel: chunk.sourceLabel,
                    locator: chunk.locator,
                    excerpt: chunk.text.slice(0, 300),
                },
            ],
        }));
        const topics = Array.from(
            new Set(
                sections
                    .flatMap((section) => section.title.split(/\s+/).slice(0, 3))
                    .map((topic) => topic.replace(/[^\p{L}\p{N}-]/gu, ""))
                    .filter((topic) => topic.length >= 4),
            ),
        ).slice(0, 12);

        const structure = await this.structureModel
            .findOneAndUpdate(
                { jobId: new Types.ObjectId(job._id) },
                {
                    $set: {
                        jobId: new Types.ObjectId(job._id),
                        materialId: new Types.ObjectId(job.materialId),
                        topics,
                        sections,
                    },
                },
                { new: true, upsert: true, runValidators: true },
            )
            .lean();

        const structureView = structure as typeof structure & { createdAt?: Date };
        return {
            _id: String(structure._id),
            jobId: String(structure.jobId),
            materialId: String(structure.materialId),
            topics: structure.topics,
            sections: structure.sections,
            createdAt: structureView.createdAt,
        };
    }

    /**
     * Executa a operação derive title no domínio de estrutura de materiais com contrato explícito.
     *
     * @param text Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
     * @param order Valor de order usado pela função para executar derive title com dados explícitos.
     * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
     */
    private deriveTitle(text: string, order: number): string {
        const firstLine = text.split(/\n/)[0]?.trim();
        if (firstLine && firstLine.length <= 90) return firstLine;
        return `Secção ${order}`;
    }
}
