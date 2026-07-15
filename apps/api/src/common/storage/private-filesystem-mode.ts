/**
 * Compatibiliza a verificação de permissões privadas entre POSIX e Windows.
 */

/**
 * Confirma um modo privado quando o sistema operativo expõe bits POSIX.
 *
 * No Windows, `chmod` e `Stats.mode` não representam ACLs NTFS através dos bits
 * de utilizador/grupo/outros. Nessa plataforma, a privacidade é assegurada
 * pelas ACLs herdadas do perfil do utilizador e pelas restantes barreiras do
 * diretório dedicado; comparar `0600`/`0700` produziria um falso negativo.
 *
 * @param actualMode Modo devolvido por `stat`/`lstat`, incluindo bits do tipo.
 * @param expectedMode Modo privado esperado, normalmente `0600` ou `0700`.
 * @param platform Plataforma Node.js, substituível para testes determinísticos.
 * @returns `true` quando a verificação é válida para a plataforma atual.
 */
export function hasExpectedPrivateFilesystemMode(
    actualMode: number,
    expectedMode: number,
    platform: NodeJS.Platform = process.platform,
): boolean {
    if (platform === "win32") return true;
    return (actualMode & 0o777) === expectedMode;
}
