/**
 * Constrói prompts de ai mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { StudyToolType } from "../dto/create-study-tool.dto.js";
import { AiSource } from "../providers/ai-provider.js";
import { formatUntrustedAiSources } from "./untrusted-sources.prompt.js";

/**
 * Contrato de artefactos de IA que documenta a estrutura esperada em tempo de desenvolvimento.
 */
type StudyToolPromptInput = {
    areaName: string;
    type: StudyToolType;
    sources: AiSource[];
    topic?: string;
    voiceTone?: string;
    conversationHistory?: string;
};

const OUTPUT_CONTRACTS: Record<StudyToolType, string> = {
    EXPLANATION: `{
  "title": "string",
  "sections": [
    { "heading": "string", "body": "string", "sourceMaterialIds": ["string"] }
  ]
}`,
    FLASHCARDS: `{
  "cards": [
    { "front": "string", "back": "string", "sourceMaterialIds": ["string"] }
  ]
}`,
    QUIZ: `{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctOptionIndex": 0,
      "explanation": "string",
      "sourceMaterialIds": ["string"]
    }
  ]
}`,
};

/**
 * Constrói o prompt de ferramenta de estudo.
 *
 * @param input Dados pedagógicos, fontes e tipo pedido.
 * @returns Prompt final com contrato JSON explícito.
 */
export function buildStudyToolPrompt(input: StudyToolPromptInput): string {
    const sourceText = formatUntrustedAiSources(
        input.sources.map((source) => ({
            id: source.materialId,
            title: source.title,
            contentText: source.contentText,
        })),
    );

    return `
És a IA privada do StudyFlow para a área "${input.areaName}".
Cria uma ferramenta de estudo do tipo ${input.type}.
Usa apenas as fontes e o histórico fornecidos. Não uses conhecimento externo, web search ou matéria inventada.
Tom pedagógico pretendido: ${input.voiceTone ?? "normal"}.
Foco pedido pelo aluno: ${input.topic?.trim() || "sem foco específico"}.

Regras:
- Se a fonte não sustentar uma afirmação, não escrevas essa afirmação.
- Cada resultado deve indicar sourceMaterialIds; usa [] quando não existirem fontes académicas.
- Para QUIZ, cria perguntas de escolha múltipla com exatamente 4 opções e apenas 1 índice correto.
- Estes quizzes são ferramentas de estudo, não testes oficiais de professor.

Devolve apenas JSON válido neste formato:
${OUTPUT_CONTRACTS[input.type]}

Fontes:
${input.sources.length ? sourceText : "Sem fontes académicas; usa apenas o histórico citado."}

${input.conversationHistory ?? ""}
`.trim();
}
