export type MockupAlignmentStatus = "PENDENTE" | "VALIDADO" | "BLOQUEADO";

export type MockupAlignmentItem = {
    id: string;
    screen: string;
    realPath: string;
    mockupFocus: string;
    expectedState: string;
    evidence: string;
    status: MockupAlignmentStatus;
};

export type MockupAlignmentSummary = {
    total: number;
    pending: number;
    validated: number;
    blocked: number;
};

const allowedMockupAlignmentPaths = new Set([
    "/app",
    "/app/salas",
    "/app/professor/turmas",
]);

/**
 * Lista os ecrãs prioritários para aproximar a UI real ao mockup.
 *
 * @returns Itens de revisão visual ligados a rotas reais da aplicação.
 */
export function buildMockupAlignmentChecklist(): MockupAlignmentItem[] {
    return [
        {
            id: "solo-study-dashboard",
            screen: "Dashboard do aluno",
            realPath: "/app",
            mockupFocus: "hierarquia inicial, cartões de progresso e chamadas de ação",
            expectedState: "áreas, rotinas, materiais e ações principais visíveis sem ruído visual",
            evidence: "screenshot desktop e mobile com conta seed de aluno",
            status: "PENDENTE",
        },
        {
            id: "study-rooms",
            screen: "Salas de estudo",
            realPath: "/app/salas",
            mockupFocus: "organização de salas, partilhas e ações principais",
            expectedState: "lista ou estado vazio com ações claras para criar e abrir salas",
            evidence: "screenshot com estado vazio e screenshot com sala populada",
            status: "PENDENTE",
        },
        {
            id: "teacher-classes",
            screen: "Área docente",
            realPath: "/app/professor/turmas",
            mockupFocus: "navegação docente, turmas, disciplinas e ações de acompanhamento",
            expectedState: "turmas acessíveis, ações docentes visíveis e feedback de carregamento controlado",
            evidence: "screenshot com conta seed de professor",
            status: "PENDENTE",
        },
    ];
}

/**
 * Calcula totais da checklist sem guardar dados pessoais nem screenshots no código.
 *
 * @param items Itens de revisão visual.
 * @returns Totais por estado para apresentar na UI e usar em defesa.
 */
export function summarizeMockupAlignment(
    items: MockupAlignmentItem[],
): MockupAlignmentSummary {
    return items.reduce<MockupAlignmentSummary>(
        (summary, item) => {
            // A contagem deriva dos itens para evitar números manuais divergentes na defesa.
            if (item.status === "PENDENTE") summary.pending += 1;
            if (item.status === "VALIDADO") summary.validated += 1;
            if (item.status === "BLOQUEADO") summary.blocked += 1;
            summary.total += 1;
            return summary;
        },
        { total: 0, pending: 0, validated: 0, blocked: 0 },
    );
}

/**
 * Valida a checklist antes de a UI apresentar itens de evidence.
 *
 * @param items Itens de revisão visual.
 * @returns Lista de mensagens de erro; lista vazia significa contrato válido.
 */
export function validateMockupAlignmentChecklist(
    items: MockupAlignmentItem[],
): string[] {
    return items.flatMap((item) => {
        const errors: string[] = [];
        if (!allowedMockupAlignmentPaths.has(item.realPath)) {
            errors.push(`${item.screen}: rota real não reconhecida (${item.realPath}).`);
        }
        if (item.evidence.trim().length === 0) {
            errors.push(`${item.screen}: evidence visual em falta.`);
        }
        // O mockup orienta a revisão; a rota real continua a ser a âncora técnica.
        if (item.mockupFocus.trim().length === 0) {
            errors.push(`${item.screen}: foco visual do mockup em falta.`);
        }
        return errors;
    });
}
