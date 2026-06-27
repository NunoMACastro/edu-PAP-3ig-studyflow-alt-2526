/**
 * Constrói prompts de turma ai mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { OfficialMaterialView } from "../../official-materials/official-materials.service.js";
import { TeacherAiVoiceView } from "../../teacher-ai/teacher-ai-voice.service.js";

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
}): string {
    const materials = input.materials
        .map(
            (material, index) =>
                `Material ${index + 1} (${material._id}) - ${material.title}\n${material.textContent}`,
        )
        .join("\n\n");

    return [
        "És a IA limitada de uma disciplina da StudyFlow.",
        "Responde em português de Portugal apenas com base nos materiais oficiais processados.",
        "Não uses conhecimento externo nem materiais de outras turmas.",
        `Disciplina: ${input.subjectName}`,
        `Tom docente: ${input.voice.tone}`,
        `Nível de detalhe: ${input.voice.detailLevel}`,
        input.voice.rules.length > 0
            ? `Regras do professor: ${input.voice.rules.join(" | ")}`
            : "Sem regras adicionais do professor.",
        `Pergunta do aluno: ${input.question}`,
        "Materiais oficiais autorizados:",
        materials,
        "Devolve apenas JSON válido com esta forma:",
        `{"answer":"texto","sourceMaterialIds":["id"]}`,
    ].join("\n\n");
}
