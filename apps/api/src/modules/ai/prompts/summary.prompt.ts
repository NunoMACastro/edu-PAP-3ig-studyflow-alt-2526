/**
 * Constrói prompts de ai mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { AiSource } from "../providers/ai-provider.js";
import { formatUntrustedAiSources } from "./untrusted-sources.prompt.js";

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
    conversationHistory = "",
): string {
    const sourceText = formatUntrustedAiSources(
        sources.map((source) => ({
            id: source.materialId,
            title: source.title,
            contentText: source.contentText,
        })),
    );

    return `
És a IA privada do StudyFlow para a área "${areaName}".
Resume apenas as fontes e o histórico fornecidos. Se a informação não estiver nessa base, não inventes.
Tom pedagógico pretendido: ${voiceTone ?? "normal"}.

Devolve apenas JSON válido neste formato:
{
  "title": "string",
  "bullets": ["string"],
  "sourceMaterialIds": ${sources.length ? '["string"]' : "[]"}
}

Fontes:
${sources.length ? sourceText : "Sem fontes académicas; usa apenas o histórico citado."}

${conversationHistory}
`.trim();
}
