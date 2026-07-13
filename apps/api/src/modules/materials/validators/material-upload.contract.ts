/**
 * Contratos partilhados entre a validação multipart e o schema de materiais.
 */

/**
 * Limite persistido do nome original apresentado ao utilizador.
 *
 * O storage usa chaves UUID opacas, mas o nome continua a ser input não
 * confiável guardado em MongoDB e incluído em exportações. O limite de 255
 * caracteres mantém o metadado pequeno e compatível com convenções comuns de
 * nomes de ficheiro, sem o usar como path no filesystem.
 */
export const MAX_MATERIAL_ORIGINAL_NAME_LENGTH = 255;
