/**
 * Constrói o prompt da IA supervisionada de uma sala guiada.
 */
import { OfficialMaterialView } from "../../official-materials/official-materials.service.js";
import { TeacherAiVoiceView } from "../../teacher-ai/teacher-ai-voice.service.js";
import { formatUntrustedAiSources } from "../../ai/prompts/untrusted-sources.prompt.js";

/** Produz um contrato fechado, limitado às fontes selecionadas pelo professor. */
export function buildGuidedStudyRoomAiPrompt(input: {
    roomTitle: string;
    goal?: string;
    description: string;
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
        "És a IA supervisionada de uma sala de estudo guiada da StudyFlow.",
        "Responde em português de Portugal apenas com base nos materiais oficiais selecionados.",
        "Não uses conhecimento externo, não inventes fontes e explica quando as fontes não chegam.",
        `Sala: ${input.roomTitle}`,
        input.goal ? `Objetivo: ${input.goal}` : "Sem objetivo adicional.",
        `Instruções do professor: ${input.description}`,
        `Tom: ${input.voice.tone}`,
        `Nível de detalhe: ${input.voice.detailLevel}`,
        input.voice.rules.length
            ? `Regras do professor: ${input.voice.rules.join(" | ")}`
            : "Sem regras adicionais do professor.",
        input.conversationHistory || "",
        `Pergunta do aluno: ${input.question}`,
        "Materiais autorizados:",
        materials,
        "Devolve apenas JSON válido:",
        `{"answer":"texto","sourceMaterialIds":["id"]}`,
    ].join("\n\n");
}
