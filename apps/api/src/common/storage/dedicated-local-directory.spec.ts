/** Testes das fronteiras canónicas usadas antes de writes e remoções locais. */
import { mkdtemp, mkdir, stat, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
    ensureStudyFlowDirectory,
    normaliseDedicatedLocalDirectory,
} from "./dedicated-local-directory.js";

describe("diretório local dedicado", () => {
    it("recusa um antepassado symlink que resolve para dentro do checkout", async () => {
        const root = await mkdtemp(join(tmpdir(), "studyflow-directory-boundary-"));
        const checkout = join(root, "checkout");
        const alias = join(root, "outside-alias");
        await mkdir(checkout);
        await symlink(checkout, alias, "dir");
        const target = normaliseDedicatedLocalDirectory(
            join(alias, "studyflow-materials"),
            { envName: "MATERIALS_STORAGE_DIR", blockedRoots: [checkout] },
        );

        await expect(
            ensureStudyFlowDirectory(target, "material-storage", {
                blockedRoots: [checkout],
            }),
        ).rejects.toThrow("raiz bloqueada");
        await expect(stat(join(checkout, "studyflow-materials"))).rejects.toMatchObject({
            code: "ENOENT",
        });
    });
});
