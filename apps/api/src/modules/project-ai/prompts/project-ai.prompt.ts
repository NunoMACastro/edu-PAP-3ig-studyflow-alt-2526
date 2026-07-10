/**
 * Constrói prompts de planeamento de projetos com IA mantendo o contexto pedagógico separado da lógica de serviço.
 */
import { ClassProjectView } from "../../class-projects/class-projects.service.js";

/**
 * Constrói prompt restrito ao enunciado oficial do projecto.
 *
 * @param input Dados estruturados da operação, já alinhados com o DTO ou contrato público correspondente.
 * @returns Texto normalizado, identificador ou conteúdo seguro produzido pela operação.
 */
export function buildProjectAiPrompt(input: {
    project: ClassProjectView;
    studentGoal: string;
    knownDifficulties: string[];
}): string {
    return [
        "És um assistente de estudo. Ajuda o aluno a planear o projecto sem escrever o trabalho por ele.",
        "Responde apenas em JSON com: steps: string[] e rationale: string.",
        `Projecto: ${input.project.title}`,
        `Enunciado oficial: ${input.project.brief}`,
        `Objectivo do aluno: ${input.studentGoal}`,
        `Dificuldades indicadas: ${input.knownDifficulties.join("; ") || "nenhuma"}`,
    ].join("\n");
}
