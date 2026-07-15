/**
 * Testa a política portátil de permissões do storage privado.
 */
import { hasExpectedPrivateFilesystemMode } from "./private-filesystem-mode.js";

describe("hasExpectedPrivateFilesystemMode", () => {
    it("exige exatamente 0600 para ficheiros em sistemas POSIX", () => {
        expect(
            hasExpectedPrivateFilesystemMode(0o100600, 0o600, "linux"),
        ).toBe(true);
        expect(
            hasExpectedPrivateFilesystemMode(0o100644, 0o600, "darwin"),
        ).toBe(false);
    });

    it("exige exatamente 0700 para diretórios em sistemas POSIX", () => {
        expect(
            hasExpectedPrivateFilesystemMode(0o040700, 0o700, "darwin"),
        ).toBe(true);
        expect(
            hasExpectedPrivateFilesystemMode(0o040755, 0o700, "linux"),
        ).toBe(false);
    });

    it("não interpreta bits POSIX como ACLs NTFS no Windows", () => {
        expect(
            hasExpectedPrivateFilesystemMode(0o100666, 0o600, "win32"),
        ).toBe(true);
        expect(
            hasExpectedPrivateFilesystemMode(0o040777, 0o700, "win32"),
        ).toBe(true);
    });
});
