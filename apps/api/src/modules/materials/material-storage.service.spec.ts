/**
 * Testes focados do storage local transacional/reconciliável.
 */
import { mkdtemp, readFile, readdir, rm, stat, utimes } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { resolve } from "node:path";
import {
    defaultMaterialStorageDirectory,
} from "../../common/storage/material-storage-directory.js";
import { MaterialStorageService } from "./material-storage.service.js";

const ownerId = "507f1f77bcf86cd799439010";

describe("MaterialStorageService", () => {
    let root: string;
    let previousRoot: string | undefined;
    let previousQuota: string | undefined;
    let previousGlobalQuota: string | undefined;
    let previousStagingRetention: string | undefined;
    let previousOrphanRetention: string | undefined;
    let service: MaterialStorageService;

    beforeEach(async () => {
        root = await mkdtemp(resolve(tmpdir(), "studyflow-storage-"));
        previousRoot = process.env.MATERIALS_STORAGE_DIR;
        previousQuota = process.env.MATERIALS_STORAGE_USER_QUOTA_BYTES;
        previousGlobalQuota = process.env.MATERIALS_STORAGE_GLOBAL_QUOTA_BYTES;
        previousStagingRetention =
            process.env.MATERIALS_STORAGE_STAGING_RETENTION_MS;
        previousOrphanRetention =
            process.env.MATERIALS_STORAGE_ORPHAN_RETENTION_MS;
        process.env.MATERIALS_STORAGE_DIR = root;
        process.env.MATERIALS_STORAGE_USER_QUOTA_BYTES = "1024";
        process.env.MATERIALS_STORAGE_GLOBAL_QUOTA_BYTES = "4096";
        process.env.MATERIALS_STORAGE_STAGING_RETENTION_MS = "1";
        process.env.MATERIALS_STORAGE_ORPHAN_RETENTION_MS = "1";
        service = new MaterialStorageService();
    });

    afterEach(async () => {
        restoreEnv("MATERIALS_STORAGE_DIR", previousRoot);
        restoreEnv("MATERIALS_STORAGE_USER_QUOTA_BYTES", previousQuota);
        restoreEnv("MATERIALS_STORAGE_GLOBAL_QUOTA_BYTES", previousGlobalQuota);
        restoreEnv(
            "MATERIALS_STORAGE_STAGING_RETENTION_MS",
            previousStagingRetention,
        );
        restoreEnv(
            "MATERIALS_STORAGE_ORPHAN_RETENTION_MS",
            previousOrphanRetention,
        );
        await rm(root, { recursive: true, force: true });
    });

    it("resolve o storage predefinido dentro do home do utilizador", () => {
        expect(defaultMaterialStorageDirectory()).toBe(
            resolve(homedir(), ".studyflow", "studyflow-materials"),
        );
    });

    it("promove staging de forma atómica e guarda ficheiro privado", async () => {
        const staged = await service.stage(ownerId, makeFile("conteúdo"));
        await service.prepareCommit(staged);
        await service.commit(staged);

        await expect(service.read(staged.storageKey)).resolves.toEqual(
            Buffer.from("conteúdo"),
        );
        expect(await service.listCommittedKeys()).toEqual([staged.storageKey]);
        const info = await stat(resolve(root, staged.storageKey));
        expect(info.mode & 0o777).toBe(0o600);
        expect(staged.sha256).toMatch(/^[a-f0-9]{64}$/);
    });

    it("reconcilia commit interrompido apenas quando Mongo referencia a chave", async () => {
        const staged = await service.stage(ownerId, makeFile("recuperável"));
        await service.prepareCommit(staged);

        const summary = await service.reconcile([staged.storageKey]);

        expect(summary.committed).toBe(1);
        await expect(service.read(staged.storageKey)).resolves.toEqual(
            Buffer.from("recuperável"),
        );
    });

    it("compensa staging sem documento depois da janela de segurança", async () => {
        const staged = await service.stage(ownerId, makeFile("órfão"));
        await service.prepareCommit(staged);
        const old = new Date(Date.now() - 5_000);
        await utimes(resolve(root, ".outbox", `${staged.operationId}.json`), old, old);

        const summary = await service.reconcile([], new Date(Date.now() + 5_000));

        expect(summary.aborted).toBe(1);
        await expect(readFile(resolve(root, staged.stagingKey))).rejects.toThrow();
    });

    it("só executa delete durável depois de desaparecer a referência Mongo", async () => {
        const staged = await service.stage(ownerId, makeFile("apagar"));
        await service.commit(staged);
        const deletion = await service.prepareDelete(ownerId, staged.storageKey);

        const retained = await service.reconcile([staged.storageKey]);
        expect(retained.pending).toBe(1);
        await expect(service.read(staged.storageKey)).resolves.toBeInstanceOf(Buffer);

        const deleted = await service.reconcile([]);
        expect(deleted.deleted).toBe(1);
        await expect(service.read(staged.storageKey)).rejects.toThrow();
        expect(deletion.operationId).toBeTruthy();
    });

    it("impõe quota antes de escrever staging adicional", async () => {
        process.env.MATERIALS_STORAGE_USER_QUOTA_BYTES = "5";
        await service.stage(ownerId, makeFile("12345"));

        await expect(service.stage(ownerId, makeFile("6"))).rejects.toMatchObject({
            response: expect.objectContaining({
                code: "MATERIAL_STORAGE_QUOTA_EXCEEDED",
            }),
        });
    });

    it("serializa uploads concorrentes e impõe a quota global entre utilizadores", async () => {
        process.env.MATERIALS_STORAGE_USER_QUOTA_BYTES = "100";
        process.env.MATERIALS_STORAGE_GLOBAL_QUOTA_BYTES = "10";

        const results = await Promise.allSettled([
            service.stage(ownerId, makeFile("123456")),
            service.stage("507f1f77bcf86cd799439099", makeFile("abcdef")),
        ]);

        expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
            1,
        );
        const rejected = results.find(
            ({ status }) => status === "rejected",
        ) as PromiseRejectedResult;
        expect(rejected.reason).toMatchObject({
            response: expect.objectContaining({
                code: "MATERIAL_STORAGE_GLOBAL_QUOTA_EXCEEDED",
            }),
        });
    });

    it("recusa traversal em chaves de leitura", async () => {
        await expect(service.read("users/../segredo")).rejects.toThrow(
            "Chave de storage inválida",
        );
    });

    it("valida readiness sem deixar ficheiros de probe", async () => {
        await expect(service.checkReady()).resolves.toBeUndefined();

        expect(await readdir(resolve(root, ".staging"))).toEqual([]);
        expect((await stat(root)).mode & 0o777).toBe(0o700);
    });

    it("cancela a outbox de delete sem apagar o ficheiro comprometido", async () => {
        const staged = await service.stage(ownerId, makeFile("manter"));
        await service.commit(staged);
        const deletion = await service.prepareDelete(ownerId, staged.storageKey);

        await service.cancelDelete(deletion);

        await expect(service.read(staged.storageKey)).resolves.toEqual(
            Buffer.from("manter"),
        );
        expect(await readdir(resolve(root, ".outbox"))).toEqual([]);
    });

    it("recusa diretório configurado relativo ao checkout", async () => {
        process.env.MATERIALS_STORAGE_DIR = "storage/materials";

        await expect(service.checkReady()).rejects.toThrow("path absoluto");
    });
});

function makeFile(content: string): Express.Multer.File {
    const buffer = Buffer.from(content);
    return {
        buffer,
        size: buffer.byteLength,
        mimetype: "application/pdf",
        originalname: "fonte.pdf",
    } as Express.Multer.File;
}

function restoreEnv(name: string, value: string | undefined): void {
    if (value === undefined) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
}
