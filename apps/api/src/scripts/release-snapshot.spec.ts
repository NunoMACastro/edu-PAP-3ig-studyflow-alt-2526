/** Testes sintéticos do artefacto e da troca de diretórios. */
import { mkdtemp, mkdir, readFile, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    createReleaseSnapshot,
    restoreReleaseSnapshot,
} from "./release-snapshot.js";

const key = Buffer.alloc(32, 19).toString("base64");

describe("snapshot e rollback de real_dev", () => {
    let parent: string;
    let implementationRoot: string;
    let snapshotRoot: string;

    beforeEach(async () => {
        parent = await mkdtemp(join(tmpdir(), "studyflow-release-test-"));
        implementationRoot = join(parent, "real_dev");
        snapshotRoot = join(parent, "studyflow-release-snapshots-test");
        await mkdir(join(implementationRoot, "api", "src", "common", "storage"), { recursive: true });
        await mkdir(join(implementationRoot, "api", "src", "scripts"), { recursive: true });
        await mkdir(join(implementationRoot, "api", "node_modules", "pkg"), {
            recursive: true,
        });
        await mkdir(join(implementationRoot, "web", "dist"), { recursive: true });
        await writeFile(join(implementationRoot, "api", "src", "main.ts"), "export {};\n");
        await writeFile(
            join(implementationRoot, "api", "src", "common", "storage", "dedicated-local-directory.ts"),
            "export {};\n",
        );
        await writeFile(
            join(implementationRoot, "api", "src", "scripts", "release-snapshot.ts"),
            "export {};\n",
        );
        await writeFile(join(implementationRoot, "api", "package.json"), "{}\n");
        await writeFile(join(implementationRoot, "web", "package.json"), "{}\n");
        await writeFile(join(implementationRoot, "api", ".env"), "SECRET=sintético\n");
        await writeFile(join(implementationRoot, "api", ".env.local"), "SECRET=local\n");
        await writeFile(join(implementationRoot, "api", ".npmrc"), "token=sintético\n");
        await writeFile(join(implementationRoot, "api", "private.pem"), "chave sintética\n");
        await writeFile(join(implementationRoot, "web", "dist", "bundle.js"), "build");
        await writeFile(
            join(implementationRoot, "api", "node_modules", "pkg", "index.js"),
            "dependency",
        );
    });

    afterEach(async () => {
        await rm(parent, { recursive: true, force: true });
    });

    it("cria snapshot autenticado sem secrets, dependências ou builds", async () => {
        const result = await createReleaseSnapshot({
            implementationRoot,
            snapshotRoot,
            authenticationKey: key,
            now: new Date("2026-07-10T10:00:00.000Z"),
        });
        const manifest = JSON.parse(
            await readFile(join(result.snapshotDir, "manifest.json"), "utf8"),
        );
        const paths = manifest.files.map((entry: { path: string }) => entry.path);

        expect(result.files).toBe(5);
        expect(paths).toContain("api/src/main.ts");
        expect(paths).toContain("api/src/common/storage/dedicated-local-directory.ts");
        expect(paths).not.toContain("api/.env");
        expect(paths).not.toContain("api/.env.local");
        expect(paths).not.toContain("api/.npmrc");
        expect(paths).not.toContain("api/private.pem");
        expect(paths.some((path: string) => path.includes("node_modules"))).toBe(false);
        expect(paths.some((path: string) => path.includes("dist"))).toBe(false);
        expect(manifest.manifestHmacSha256).toMatch(/^[a-f0-9]{64}$/);
        expect((await stat(result.snapshotDir)).mode & 0o777).toBe(0o700);
    });

    it("repõe exatamente o snapshot, preserva .env e mantém a árvore anterior", async () => {
        const snapshot = await createReleaseSnapshot({
            implementationRoot,
            snapshotRoot,
            authenticationKey: key,
            now: new Date("2026-07-10T10:00:00.000Z"),
        });
        await writeFile(join(implementationRoot, "api", "src", "main.ts"), "alterado\n");
        await writeFile(join(implementationRoot, "api", "src", "extra.ts"), "extra\n");

        const result = await restoreReleaseSnapshot({
            implementationRoot,
            snapshotDir: snapshot.snapshotDir,
            authenticationKey: key,
            allowRollback: true,
            confirmation: snapshot.snapshotId,
            now: new Date("2026-07-10T11:00:00.000Z"),
        });

        expect(await readFile(join(implementationRoot, "api", "src", "main.ts"), "utf8"))
            .toBe("export {};\n");
        await expect(stat(join(implementationRoot, "api", "src", "extra.ts")))
            .rejects.toMatchObject({ code: "ENOENT" });
        expect(await readFile(join(implementationRoot, "api", ".env"), "utf8"))
            .toBe("SECRET=sintético\n");
        expect((await stat(result.previousDir)).isDirectory()).toBe(true);
        expect(result.cleanInstallRequired).toBe(true);
    });

    it("falha antes de qualquer troca quando a confirmação não coincide", async () => {
        const snapshot = await createReleaseSnapshot({
            implementationRoot,
            snapshotRoot,
            authenticationKey: key,
        });
        await expect(
            restoreReleaseSnapshot({
                implementationRoot,
                snapshotDir: snapshot.snapshotDir,
                authenticationKey: key,
                allowRollback: true,
                confirmation: "release-errada",
            }),
        ).rejects.toThrow("ROLLBACK_CONFIRMATION");
        expect(await readFile(join(implementationRoot, "api", "src", "main.ts"), "utf8"))
            .toBe("export {};\n");
    });

    it("recusa raiz de snapshots que resolve por symlink para real_dev", async () => {
        await symlink(implementationRoot, snapshotRoot, "dir");
        await expect(
            createReleaseSnapshot({
                implementationRoot,
                snapshotRoot,
                authenticationKey: key,
            }),
        ).rejects.toThrow("raiz bloqueada");
    });
});
