/**
 * Carrega e persiste as fixtures PDF da seed através do storage oficial.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { MaterialStorageService } from "../../modules/materials/material-storage.service.js";
import { validateMaterialUpload } from "../../modules/materials/validators/material-upload.validator.js";

export type DemoPdfChunk = {
    order: number;
    text: string;
    sourceLabel: string;
    locator: string;
};

export type DemoPdfFixture = {
    key: string;
    filename: string;
    title: string;
    subject: string;
    mimeType: "application/pdf";
    chunks: DemoPdfChunk[];
    buffer: Buffer;
    sha256: string;
};

export type StoredDemoPdf = {
    storageKey: string;
    storageSha256: string;
    originalName: string;
    mimeType: "application/pdf";
    sizeBytes: number;
};

type FixtureManifest = {
    version: 1;
    documents: Array<Omit<DemoPdfFixture, "buffer" | "sha256">>;
};

/**
 * Fachada pequena para o preflight, escrita e limpeza segura das fixtures.
 */
export class DemoPdfStorage {
    private readonly storage = new MaterialStorageService();

    /** Valida storage, manifesto, assinaturas e metadados antes de qualquer reset. */
    async preflight(): Promise<Map<string, DemoPdfFixture>> {
        await this.storage.checkReady();
        const root = resolve(process.cwd(), "seed-assets/materials");
        const manifest = JSON.parse(
            await readFile(resolve(root, "manifest.json"), "utf8"),
        ) as Partial<FixtureManifest>;
        if (manifest.version !== 1 || !Array.isArray(manifest.documents)) {
            throw new Error("Manifesto de PDFs da seed inválido.");
        }

        const fixtures = new Map<string, DemoPdfFixture>();
        for (const raw of manifest.documents) {
            if (
                !raw ||
                typeof raw.key !== "string" ||
                typeof raw.filename !== "string" ||
                typeof raw.title !== "string" ||
                typeof raw.subject !== "string" ||
                raw.mimeType !== "application/pdf" ||
                !Array.isArray(raw.chunks) ||
                raw.chunks.length === 0 ||
                fixtures.has(raw.key)
            ) {
                throw new Error("Entrada inválida ou duplicada no manifesto PDF.");
            }
            const buffer = await readFile(resolve(root, raw.filename));
            const fixture: DemoPdfFixture = {
                ...raw,
                mimeType: "application/pdf",
                buffer,
                sha256: createHash("sha256").update(buffer).digest("hex"),
            };
            validateMaterialUpload(this.toMulterFile(fixture));
            fixtures.set(fixture.key, fixture);
        }
        if (fixtures.size !== 6) {
            throw new Error("A seed exige exatamente seis fixtures PDF.");
        }
        return fixtures;
    }

    /** Guarda uma cópia privada e compensável de uma fixture. */
    async store(ownerId: string, fixture: DemoPdfFixture): Promise<StoredDemoPdf> {
        const file = this.toMulterFile(fixture);
        validateMaterialUpload(file);
        const staged = await this.storage.stage(ownerId, file);
        try {
            await this.storage.prepareCommit(staged);
            await this.storage.commit(staged);
        } catch (error) {
            await this.storage.abort(staged).catch(() => undefined);
            throw error;
        }
        return {
            storageKey: staged.storageKey,
            storageSha256: staged.sha256,
            originalName: fixture.filename,
            mimeType: "application/pdf",
            sizeBytes: staged.sizeBytes,
        };
    }

    /** Confirma que uma referência Mongo aponta para os bytes esperados. */
    async assertStored(storageKey: string, sha256: string): Promise<void> {
        const bytes = await this.storage.read(storageKey);
        const actual = createHash("sha256").update(bytes).digest("hex");
        if (actual !== sha256) {
            throw new Error(`Hash divergente no ficheiro ${storageKey}.`);
        }
    }

    /** Remove uma chave comprometida usando a outbox do storage. */
    async remove(storageKey: string): Promise<void> {
        const [, ownerId] = storageKey.split("/");
        if (!ownerId) throw new Error("Storage key sem owner válido.");
        const operation = await this.storage.prepareDelete(ownerId, storageKey);
        await this.storage.commitDelete(operation);
    }

    /** Limpa apenas ficheiros comprometidos no volume StudyFlow dedicado. */
    async clearCommitted(): Promise<number> {
        const keys = await this.storage.listCommittedKeys();
        for (const key of keys) await this.remove(key);
        return keys.length;
    }

    /** Lista chaves para a verificação final de órfãos. */
    async listCommittedKeys(): Promise<string[]> {
        return this.storage.listCommittedKeys();
    }

    private toMulterFile(fixture: DemoPdfFixture): Express.Multer.File {
        return {
            fieldname: "file",
            originalname: fixture.filename,
            encoding: "7bit",
            mimetype: fixture.mimeType,
            size: fixture.buffer.byteLength,
            buffer: fixture.buffer,
            stream: Readable.from(fixture.buffer),
            destination: "",
            filename: fixture.filename,
            path: "",
        };
    }
}
