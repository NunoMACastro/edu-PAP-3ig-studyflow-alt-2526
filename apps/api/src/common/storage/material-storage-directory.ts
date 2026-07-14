/**
 * Define o destino local predefinido dos materiais privados da StudyFlow.
 */
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Constrói o diretório dedicado dentro do home do utilizador. O argumento
 * explícito permite testar a resolução sem depender do sistema operativo nem
 * escrever no filesystem real do utilizador.
 *
 * @param homeDirectory Diretório home absoluto do utilizador atual.
 * @returns Caminho absoluto dedicado ao storage local do StudyFlow.
 */
export function defaultMaterialStorageDirectory(
    homeDirectory: string = homedir(),
): string {
    return join(homeDirectory, ".studyflow", "studyflow-materials");
}
