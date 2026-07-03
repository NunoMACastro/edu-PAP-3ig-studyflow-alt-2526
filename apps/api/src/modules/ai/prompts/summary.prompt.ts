/**
 * Constrói prompts de ai mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { AiSource } from "../providers/ai-provider.js";

/**
 * Constrói o prompt de resumo baseado apenas nas fontes da área.
 *
 * @param areaName Nome da área de estudo.
 * @param sources Fontes textuais processáveis.
 * @param voiceTone Tom pedagógico opcional configurado na área.
 * @returns Prompt final para o provider IA.
 */
export function buildSummaryPrompt(
    areaName: string,
    sources: AiSource[],
    voiceTone?: string,
): string {
    const sourceText = sources
        .map(
            (source, index) =>
                `Fonte ${index + 1} (${source.materialId}) - ${source.title}\n${source.contentText}`,
        )
        .join("\n\n");

    return `
És a IA privada do StudyFlow para a área "${areaName}".
Resume apenas as fontes fornecidas. Se a informação não estiver nas fontes, não inventes.
Tom pedagógico pretendido: ${voiceTone ?? "normal"}.

Devolve apenas JSON válido neste formato:
{
  "title": "string",
  "bullets": ["string"],
  "sourceMaterialIds": ["string"]
}

Fontes:
${sourceText}
`.trim();
}
