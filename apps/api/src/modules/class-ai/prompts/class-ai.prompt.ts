/**
 * Constrói prompts de turma ai mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { OfficialMaterialView } from "../../official-materials/official-materials.service.js";
import { TeacherAiVoiceView } from "../../teacher-ai/teacher-ai-voice.service.js";
import { formatUntrustedAiSources } from "../../ai/prompts/untrusted-sources.prompt.js";

const TONE_DESCRIPTIONS: Record<TeacherAiVoiceView["tone"], string> = {
    CALM: "calmo, encorajador e paciente",
    DIRECT: "direto, objetivo e sem rodeios desnecessários",
    SOCRATIC: "socrático, orientado por perguntas e descoberta guiada",
};

const DETAIL_DESCRIPTIONS: Record<TeacherAiVoiceView["detailLevel"], string> = {
    SHORT: "curto, apenas com o essencial",
    BALANCED: "equilibrado, com explicação suficiente e sem excesso",
    DETAILED: "detalhado, com passos intermédios e justificação explícita",
};

/**
 * Constrói prompt da IA limitada a materiais oficiais processados.
 *
 * @param input Contexto autorizado.
 * @returns Prompt com contrato JSON.
 */
export function buildClassAiPrompt(input: {
    subjectName: string;
    question: string;
    materials: OfficialMaterialView[];
    voice: TeacherAiVoiceView;
    conversationHistory?: string;
}): string {
    const materials = formatUntrustedAiSources(
        input.materials.map((material) => ({
            id: material._id,
            title: material.title,
            contentText: material.textContent ?? "",
        })),
    );

    return [
        "És a IA limitada de uma disciplina da StudyFlow.",
        "Responde em português de Portugal apenas com base nos materiais oficiais processados.",
        "Não uses conhecimento externo nem materiais de outras turmas.",
        `Disciplina: ${input.subjectName}`,
        `Tom docente: ${input.voice.tone} - ${TONE_DESCRIPTIONS[input.voice.tone]}`,
        `Nível de detalhe: ${input.voice.detailLevel} - ${DETAIL_DESCRIPTIONS[input.voice.detailLevel]}`,
        input.voice.rules.length > 0
            ? `Orientações do professor para a IA: ${input.voice.rules.join(" | ")}`
            : "Sem orientações adicionais do professor.",
        input.conversationHistory || "",
        `Pergunta do aluno: ${input.question}`,
        "Materiais oficiais autorizados:",
        materials,
        "Devolve apenas JSON válido com esta forma:",
        `{"answer":"texto","sourceMaterialIds":["id"]}`,
    ].join("\n\n");
}
