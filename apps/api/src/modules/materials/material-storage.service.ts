/**
 * Implementa as regras de negócio de materials e concentra validações do domínio.
 */
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

/**
 * Storage local de desenvolvimento para materiais.
 *
 * O BK-MF0-08 não documenta S3, Drive ou outro storage externo. Por isso, esta
 * implementação guarda ficheiros localmente e devolve apenas uma `storageKey`.
 */
@Injectable()
export class MaterialStorageService {
    private readonly root =
        process.env.MATERIALS_STORAGE_DIR ?? "storage/materials";

    /**
     * Guarda o ficheiro no storage local.
     *
     * @param file Ficheiro PDF ou DOCX já validado.
     * @returns Chave opaca persistida na base de dados.
     */
    async save(file: Express.Multer.File): Promise<string> {
        await mkdir(this.root, { recursive: true });
        const extension = file.mimetype === "application/pdf" ? "pdf" : "docx";
        const storageKey = `${randomUUID()}.${extension}`;

        await writeFile(join(this.root, storageKey), file.buffer);
        return storageKey;
    }

    /**
     * Lê um ficheiro previamente guardado pelo storage local.
     *
     * @param storageKey Chave opaca persistida no material.
     * @returns Conteúdo binário do ficheiro.
     */
    async read(storageKey: string): Promise<Buffer> {
        return readFile(join(this.root, storageKey));
    }
}
