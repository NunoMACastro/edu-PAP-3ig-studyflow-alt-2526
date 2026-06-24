/**
 * Utilizador público devolvido pela autenticação, sem `passwordHash` nem campos sensíveis.
 */
export type User = {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
};

/**
 * Perfil editável do aluno usado nas páginas de conta e personalização inicial.
 */
export type StudentProfile = {
    _id?: string;
    name: string;
    year?: string | null;
    course?: string | null;
    className?: string | null;
};

/**
 * Resumo do estudo autónomo apresentado no dashboard do aluno.
 */
export type SoloStudyState = {
    studentName: string;
    hasClass: boolean;
    className: string | null;
    studyAreasCount: number;
    routinesCount: number;
    materialsCount: number;
};

/**
 * Rotina de estudo calendarizada, incluindo dias da semana e duração.
 */
export type StudyRoutine = {
    _id: string;
    title: string;
    weekdays: string[];
    startTime: string;
    durationMinutes: number;
    archived?: boolean;
};

/**
 * Objetivo de estudo do aluno, com estado de conclusão e arquivo.
 */
export type StudyGoal = {
    _id: string;
    title: string;
    description?: string;
    targetDate?: string;
    completed?: boolean;
    archived?: boolean;
};

/**
 * Área de estudo privada que agrupa materiais, voz da IA e progresso do aluno.
 */
export type StudyArea = {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    archived?: boolean;
    voiceTone?: string;
    voiceDetailLevel?: string;
    voiceNotes?: string;
};

/**
 * Material privado submetido pelo aluno e processado pela API.
 */
export type StudyMaterial = {
    _id: string;
    title: string;
    type: "PDF" | "DOCX" | "URL" | "TOPIC";
    status: "PENDING_PROCESSING" | "READY" | "FAILED";
    url?: string;
    sizeBytes?: number;
    createdAt?: string;
};

/**
 * Tipos de artefacto IA que a UI pode pedir para uma área de estudo.
 */
export type StudyToolType = "EXPLANATION" | "FLASHCARDS" | "QUIZ";

/**
 * Referência de fonte usada para explicar a origem de um artefacto IA.
 */
export type AiArtifactSource = {
    materialId?: string;
    title?: string;
    page?: number;
    section?: string;
};

/**
 * Artefacto gerado pela IA, como resumo, explicação, flashcards ou quiz.
 */
export type AiArtifact = {
    _id: string;
    studyAreaId: string;
    type: "SUMMARY" | StudyToolType;
    contentJson: Record<string, unknown>;
    sourcesJson: AiArtifactSource[];
    createdAt?: string;
    updatedAt?: string;
};

/**
 * Resultado de uma resposta individual dentro de uma tentativa de quiz.
 */
export type QuizAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    sourceMaterialIds: string[];
};

/**
 * Correção completa de uma tentativa de quiz calculada pelo backend.
 */
export type QuizAttemptResult = {
    _id: string;
    artifactId: string;
    studyAreaId: string;
    correctCount: number;
    totalQuestions: number;
    scorePercent: number;
    answeredAt: string;
    results: QuizAttemptQuestionResult[];
};

/**
 * Perfil pedagógico da área, usado para adaptar ritmo, nível e estilo das explicações.
 */
export type LearningProfile = {
    _id?: string;
    studyAreaId: string;
    pace: "SLOW" | "BALANCED" | "FAST";
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    difficulties: string[];
    preferredExplanationStyle: string;
};

/**
 * Explicação adaptativa guardada com pergunta, resposta e próximos passos sugeridos.
 */
export type AdaptiveExplanation = {
    _id: string;
    studyAreaId: string;
    question: string;
    answer: string;
    suggestedNextSteps: string[];
    sourceMaterialIds: string[];
    createdAt?: string;
};

/**
 * Sala de estudo colaborativa onde alunos partilham notas, URLs e materiais.
 */
export type StudyRoom = {
    _id: string;
    ownerStudentId: string;
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
    memberIds: string[];
    createdAt?: string;
};

/**
 * Partilha criada numa sala, podendo ou não ficar disponível para IA.
 */
export type RoomShare = {
    _id: string;
    roomId: string;
    authorStudentId: string;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string;
    textContent?: string;
    url?: string;
    materialId?: string;
    materialTitle?: string;
    usableByAi: boolean;
    createdAt?: string;
};

/**
 * Resposta da IA da sala baseada nas partilhas autorizadas.
 */
export type RoomAiAnswer = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    sources: { shareId: string; title: string; contentText: string }[];
    createdAt?: string;
};

/**
 * Turma oficial criada por um professor e associada a alunos inscritos.
 */
export type SchoolClass = {
    _id: string;
    teacherId: string;
    name: string;
    code: string;
    schoolYear: string;
    studentIds: string[];
    createdAt?: string;
};

/**
 * Disciplina de uma turma, usada como fronteira para materiais oficiais e IA docente.
 */
export type Subject = {
    _id: string;
    classId: string;
    teacherId: string;
    name: string;
    code: string;
    description?: string;
    createdAt?: string;
};

/**
 * Material oficial da disciplina, criado pelo professor e usado como fonte controlada.
 */
export type OfficialMaterial = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    type: "TEXT" | "URL";
    status: "PROCESSED" | "REFERENCE_ONLY";
    textContent?: string;
    sourceUrl?: string;
    createdAt?: string;
};

/**
 * Configuração da voz pedagógica que orienta a IA da disciplina.
 */
export type TeacherAiVoice = {
    _id?: string;
    subjectId: string;
    classId?: string;
    teacherId?: string;
    tone: "CALM" | "DIRECT" | "SOCRATIC";
    detailLevel: "SHORT" | "BALANCED" | "DETAILED";
    rules: string[];
};

/**
 * Resposta da IA da disciplina acompanhada das fontes oficiais usadas.
 */
export type ClassAiAnswer = {
    _id: string;
    subjectId: string;
    classId: string;
    question: string;
    answer: string;
    sources: OfficialMaterial[];
    createdAt?: string;
};

/**
 * Aviso ou publicação enviado pelo professor para a turma.
 */
export type ClassPost = {
    _id: string;
    classId: string;
    teacherId: string;
    type: "NOTICE" | "POST";
    title: string;
    body: string;
    createdAt?: string;
};

/**
 * Sala de estudo guiado criada pelo professor para uma turma.
 */
export type GuidedStudyRoom = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    description: string;
    materialIds: string[];
    status: "OPEN" | "CLOSED";
    createdAt?: string;
};

/**
 * Projeto atribuído à turma e opcionalmente visível para alunos.
 */
export type ClassProject = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    brief: string;
    subject?: string;
    dueDate?: string;
    status: "DRAFT" | "PUBLISHED";
    createdAt?: string;
};

/**
 * Plano gradual gerado pela IA para apoiar o aluno num projeto.
 */
export type ProjectAiPlan = {
    _id: string;
    projectId: string;
    studentGoal: string;
    knownDifficulties: string[];
    steps: string[];
    rationale?: string;
    createdAt?: string;
};

/**
 * Pergunta de teste oficial com opções e índice da resposta correta.
 */
export type OfficialTestQuestion = {
    statement: string;
    topic?: string;
    options: string[];
    correctOptionIndex: number;
};

/**
 * Teste ou mini-teste oficial associado a uma disciplina.
 */
export type OfficialTest = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    description?: string;
    status: "DRAFT" | "PUBLISHED";
    questions: OfficialTestQuestion[];
    createdAt?: string;
};

/**
 * Revisão docente de conteúdo gerado por IA, com decisão e comentário auditáveis.
 */
export type AiContentReview = {
    _id: string;
    subjectId: string;
    materialId: string;
    teacherId: string;
    contentType: "SUMMARY" | "QUIZ";
    contentJson: Record<string, unknown>;
    status: "PENDING" | "APPROVED" | "REJECTED";
    teacherComment?: string;
    createdAt?: string;
};

/**
 * Agregado de métricas da turma usado pelo professor para acompanhar progresso.
 */
export type ClassProgress = {
    classId: string;
    className: string;
    studentsCount: number;
    subjectsCount: number;
    publishedTestsCount: number;
    approvedAiContentCount: number;
    postCount: number;
    noteCount: number;
    learningProgressPercent: number | null;
    learningProgressStatus: "PENDING_RESULTS_CONTRACT";
    activitySignalTotal: number;
    activityCoveragePercent: number;
    metricsBasis: "ACTIVITY_SIGNALS";
    difficultyTags: string[];
    notes: ClassProgressNote[];
    gaps?: string[];
};

/**
 * Nota pedagógica do professor sobre dificuldades ou acompanhamento da turma.
 */
export type ClassProgressNote = {
    _id: string;
    classId: string;
    teacherId: string;
    title: string;
    note: string;
    difficultyTags: string[];
    createdAt?: string;
};

/**
 * Job de indexação textual que liga material, estado e chunks extraídos.
 */
export type MaterialIndexJob = {
    _id: string;
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    materialId: string;
    studyAreaId?: string;
    subjectId?: string;
    status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
    extractedTextChunks: {
        order: number;
        text: string;
        sourceLabel: string;
        locator: string;
    }[];
    errorMessage?: string;
    createdAt?: string;
};

/**
 * Versão de material criada a partir de um job ou conteúdo submetido.
 */
export type MaterialVersion = {
    _id: string;
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    materialId: string;
    jobId: string;
    versionNumber: number;
    title: string;
    textSnapshot: string;
    chunksSnapshot: MaterialIndexJob["extractedTextChunks"];
    changeSummary?: string;
    active: boolean;
    createdAt?: string;
};

/**
 * Excerto pedagógico associado a material privado ou oficial.
 */
export type MaterialContextItem = {
    _id: string;
    scope: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    contextId: string;
    materialId: string;
    title: string;
    source: "student" | "teacher" | "class";
    studentId?: string;
    teacherId?: string;
    createdAt?: string;
    updatedAt?: string;
};

/**
 * Resposta de contexto de materiais, incluindo itens privados ou oficiais.
 */
export type MaterialContextResponse = {
    context: "PRIVATE_AREA" | "OFFICIAL_SUBJECT";
    studyAreaId?: string;
    subjectId?: string;
    materials: MaterialContextItem[];
    contexts: MaterialContextItem[];
};

/**
 * Resposta da IA privada da área de estudo com fontes autorizadas do aluno.
 */
export type PrivateAreaAiAnswer = {
    _id: string;
    studyAreaId: string;
    question: string;
    answer: string;
    sources: { materialId: string; title: string; contentText: string }[];
    createdAt?: string;
};

/**
 * Executa um pedido JSON para a API mantendo cookies HttpOnly.
 *
 * @param path Caminho relativo começado por `/api`.
 * @param options Opções fetch adicionais.
 * @returns JSON parseado no tipo pedido pelo chamador.
 */
async function requestJson<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    // O CSRF marker permite usar cookies HttpOnly sem guardar tokens em localStorage.
    headers.set("x-studyflow-csrf", "1");

    const response = await fetch(path, {
        ...options,
        // A sessão via cookie fica centralizada aqui para todas as chamadas tipadas da UI.
        credentials: "include",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Ocorreu um erro inesperado.",
        }));
        throw new Error(error.message ?? "Ocorreu um erro inesperado.");
    }

    return response.json() as Promise<T>;
}

/**
 * Regista um aluno por email/password.
 *
 * @param input Dados do formulário de registo.
 * @returns Utilizador público criado.
 */
export function registerStudent(input: {
    email: string;
    password: string;
    confirmPassword: string;
}): Promise<User> {
    return requestJson<User>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Inicia sessão com email/password.
 *
 * @param input Credenciais do aluno.
 * @returns Utilizador autenticado.
 */
export function login(input: {
    email: string;
    password: string;
}): Promise<User> {
    return requestJson<User>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Termina a sessão atual.
 *
 * @returns Estado de sucesso.
 */
export function logout(): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

/**
 * Obtém o utilizador autenticado.
 *
 * @returns Utilizador ou lança erro quando não há sessão.
 */
export function getCurrentUser(): Promise<User> {
    return requestJson<User>("/api/auth/me");
}

/**
 * Obtém o perfil do aluno autenticado.
 *
 * @returns Perfil existente ou `null`.
 */
export function getProfile(): Promise<StudentProfile | null> {
    return requestJson<StudentProfile | null>("/api/students/me/profile");
}

/**
 * Atualiza o perfil do aluno.
 *
 * @param input Campos editáveis.
 * @returns Perfil atualizado.
 */
export function updateProfile(input: StudentProfile): Promise<StudentProfile> {
    return requestJson<StudentProfile>("/api/students/me/profile", {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Obtém estado do dashboard individual.
 *
 * @returns Estado do modo individual.
 */
export function getSoloStudyState(): Promise<SoloStudyState> {
    return requestJson<SoloStudyState>("/api/study/solo");
}

/**
 * Lista rotinas e objetivos do aluno.
 *
 * @returns Dados de organização pessoal.
 */
export function listRoutines(): Promise<{
    routines: StudyRoutine[];
    goals: StudyGoal[];
}> {
    return requestJson("/api/study/routines");
}

/**
 * Lista objetivos do aluno através do endpoint dedicado.
 *
 * @returns Objetivos ativos.
 */
export function listGoals(): Promise<StudyGoal[]> {
    return requestJson<StudyGoal[]>("/api/study/goals");
}

/**
 * Cria uma rotina de estudo.
 *
 * @param input Dados da rotina.
 * @returns Rotina criada.
 */
export function createRoutine(input: {
    title: string;
    weekdays: string[];
    startTime: string;
    durationMinutes: number;
}): Promise<unknown> {
    return requestJson("/api/study/routines", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Atualiza uma rotina de estudo.
 *
 * @param routineId Identificador da rotina.
 * @param input Campos editáveis.
 * @returns Rotina atualizada.
 */
export function updateRoutine(
    routineId: string,
    input: Partial<{
        title: string;
        weekdays: string[];
        startTime: string;
        durationMinutes: number;
    }>,
): Promise<StudyRoutine> {
    return requestJson<StudyRoutine>(`/api/study/routines/${routineId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Arquiva uma rotina sem apagar fisicamente.
 *
 * @param routineId Identificador da rotina.
 * @returns Estado de sucesso.
 */
export function archiveRoutine(routineId: string): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>(`/api/study/routines/${routineId}`, {
        method: "DELETE",
    });
}

/**
 * Cria um objetivo de estudo.
 *
 * @param input Dados do objetivo.
 * @returns Objetivo criado.
 */
export function createGoal(input: {
    title: string;
    description?: string;
    targetDate?: string;
}): Promise<unknown> {
    return requestJson("/api/study/goals", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Atualiza um objetivo de estudo.
 *
 * @param goalId Identificador do objetivo.
 * @param input Campos editáveis.
 * @returns Objetivo atualizado.
 */
export function updateGoal(
    goalId: string,
    input: Partial<{
        title: string;
        description: string;
        targetDate: string;
        completed: boolean;
    }>,
): Promise<StudyGoal> {
    return requestJson<StudyGoal>(`/api/study/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Arquiva um objetivo sem apagar fisicamente.
 *
 * @param goalId Identificador do objetivo.
 * @returns Estado de sucesso.
 */
export function archiveGoal(goalId: string): Promise<{ ok: boolean }> {
    return requestJson<{ ok: boolean }>(`/api/study/goals/${goalId}`, {
        method: "DELETE",
    });
}

/**
 * Lista eventos recentes de estudo.
 *
 * @returns Histórico do aluno.
 */
export function listStudyHistory(): Promise<unknown[]> {
    return requestJson("/api/study/history");
}

/**
 * Lista áreas de estudo pessoais.
 *
 * @returns Áreas ativas.
 */
export function listStudyAreas(): Promise<StudyArea[]> {
    return requestJson<StudyArea[]>("/api/study-areas");
}

/**
 * Obtém uma área de estudo.
 *
 * @param studyAreaId Identificador da área.
 * @returns Área encontrada.
 */
export function getStudyArea(studyAreaId: string): Promise<StudyArea> {
    return requestJson<StudyArea>(`/api/study-areas/${studyAreaId}`);
}

/**
 * Cria uma área de estudo.
 *
 * @param input Dados da área.
 * @returns Área criada.
 */
export function createStudyArea(input: {
    name: string;
    description?: string;
    color?: string;
}): Promise<StudyArea> {
    return requestJson<StudyArea>("/api/study-areas", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Atualiza campos editáveis de uma área de estudo.
 *
 * @param studyAreaId Identificador da área.
 * @param input Campos editáveis.
 * @returns Área atualizada.
 */
export function updateStudyArea(
    studyAreaId: string,
    input: Partial<{
        name: string;
        description: string;
        color: string;
        archived: boolean;
    }>,
): Promise<StudyArea> {
    return requestJson<StudyArea>(`/api/study-areas/${studyAreaId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Arquiva uma área de estudo sem apagar fisicamente.
 *
 * @param studyAreaId Identificador da área.
 * @returns Área arquivada.
 */
export function archiveStudyArea(studyAreaId: string): Promise<StudyArea> {
    return updateStudyArea(studyAreaId, { archived: true });
}

/**
 * Atualiza a voz pedagógica da área.
 *
 * @param studyAreaId Identificador da área.
 * @param input Preferências de voz.
 * @returns Área atualizada.
 */
export function updateStudyAreaVoice(
    studyAreaId: string,
    input: {
        voiceTone: string;
        voiceDetailLevel: string;
        voiceNotes?: string;
    },
): Promise<StudyArea> {
    return requestJson<StudyArea>(`/api/study-areas/${studyAreaId}/voice`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/**
 * Lista materiais de uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Materiais submetidos.
 */
export function listMaterials(studyAreaId: string): Promise<StudyMaterial[]> {
    return requestJson<StudyMaterial[]>(
        `/api/study-areas/${studyAreaId}/materials`,
    );
}

/**
 * Submete URL ou tópico textual.
 *
 * @param studyAreaId Identificador da área.
 * @param input Dados do material.
 * @returns Material criado.
 */
export function submitTextMaterial(
    studyAreaId: string,
    input: {
        type: "URL" | "TOPIC";
        title: string;
        url?: string;
        topicText?: string;
    },
): Promise<StudyMaterial> {
    return requestJson<StudyMaterial>(
        `/api/study-areas/${studyAreaId}/materials`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Submete PDF ou DOCX via multipart.
 *
 * @param studyAreaId Identificador da área.
 * @param file Ficheiro escolhido pelo aluno.
 * @param title Título opcional.
 * @returns Material criado.
 */
export async function submitFileMaterial(
    studyAreaId: string,
    file: File,
    title?: string,
): Promise<StudyMaterial> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    const response = await fetch(
        `/api/study-areas/${studyAreaId}/materials/file`,
        {
            method: "POST",
            credentials: "include",
            headers: { "x-studyflow-csrf": "1" },
            body: formData,
        },
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "Não foi possível submeter o ficheiro.",
        }));
        throw new Error(error.message ?? "Não foi possível submeter o ficheiro.");
    }

    return response.json() as Promise<StudyMaterial>;
}

/**
 * Prepara o perfil IA de uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Estado do perfil IA.
 */
export function prepareAiProfile(studyAreaId: string): Promise<unknown> {
    return requestJson(`/api/study-areas/${studyAreaId}/ai-profile`, {
        method: "POST",
    });
}

/**
 * Gera resumo IA para uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Artefacto de resumo.
 */
export function generateSummary(studyAreaId: string): Promise<AiArtifact> {
    return requestJson<AiArtifact>(`/api/study-areas/${studyAreaId}/summaries`, {
        method: "POST",
    });
}

/**
 * Lista resumos IA já gerados para uma área.
 *
 * @param studyAreaId Identificador da área.
 * @returns Resumos persistidos.
 */
export function listSummaries(studyAreaId: string): Promise<AiArtifact[]> {
    return requestJson<AiArtifact[]>(
        `/api/study-areas/${studyAreaId}/summaries`,
    );
}

/**
 * Lista ferramentas de estudo já geradas.
 *
 * @param studyAreaId Identificador da área.
 * @param type Tipo opcional.
 * @returns Artefactos IA.
 */
export function listStudyTools(
    studyAreaId: string,
    type?: StudyToolType,
): Promise<AiArtifact[]> {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    return requestJson<AiArtifact[]>(
        `/api/study-areas/${studyAreaId}/study-tools${query}`,
    );
}

/**
 * Gera explicação, flashcards ou quiz.
 *
 * @param studyAreaId Identificador da área.
 * @param input Pedido de geração.
 * @returns Artefacto criado.
 */
export function generateStudyTool(
    studyAreaId: string,
    input: { type: StudyToolType; topic?: string },
): Promise<AiArtifact> {
    return requestJson<AiArtifact>(
        `/api/study-areas/${studyAreaId}/study-tools`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Submete respostas de um quiz gerado pela IA.
 *
 * @param studyAreaId Identificador da área.
 * @param artifactId Identificador do artefacto de quiz.
 * @param answers Índices das opções escolhidas.
 * @returns Resultado calculado pelo backend.
 */
export function submitQuizAttempt(
    studyAreaId: string,
    artifactId: string,
    answers: number[],
): Promise<QuizAttemptResult> {
    return requestJson<QuizAttemptResult>(
        `/api/study-areas/${studyAreaId}/study-tools/${artifactId}/quiz-attempts`,
        {
            method: "POST",
            body: JSON.stringify({ answers }),
        },
    );
}

/**
 * Obtém o perfil de aprendizagem de uma área para ajustar ritmo, nível e estilo da IA.
 *
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @returns Perfil pedagógico atual da área.
 */
export function getLearningProfile(studyAreaId: string): Promise<LearningProfile> {
    return requestJson<LearningProfile>(
        `/api/study-areas/${studyAreaId}/learning-profile`,
    );
}

/**
 * Atualiza o perfil de aprendizagem que orienta futuras explicações adaptativas.
 *
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Perfil pedagógico persistido depois da validação backend.
 */
export function updateLearningProfile(
    studyAreaId: string,
    input: {
        pace: LearningProfile["pace"];
        level: LearningProfile["level"];
        difficulties?: string[];
        preferredExplanationStyle?: string;
    },
): Promise<LearningProfile> {
    return requestJson<LearningProfile>(
        `/api/study-areas/${studyAreaId}/learning-profile`,
        {
            method: "PUT",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Pede uma explicação adaptativa para uma pergunta do aluno dentro da área escolhida.
 *
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @param question Pergunta escrita pelo aluno e enviada ao backend para contexto IA controlado.
 * @returns Explicação guardada com resposta e próximos passos sugeridos.
 */
export function askAdaptiveExplanation(
    studyAreaId: string,
    question: string,
): Promise<AdaptiveExplanation> {
    return requestJson<AdaptiveExplanation>(
        `/api/study-areas/${studyAreaId}/adaptive-explanations`,
        {
            method: "POST",
            body: JSON.stringify({ question }),
        },
    );
}

/**
 * Lista as salas de estudo em que o aluno autenticado participa.
 * @returns Salas visíveis para o aluno atual.
 */
export function listStudyRooms(): Promise<StudyRoom[]> {
    return requestJson<StudyRoom[]>("/api/study-rooms");
}

/**
 * Cria uma sala de estudo livre ou associada a disciplina para colaboração entre alunos.
 *
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Sala criada com o aluno atual como membro inicial.
 */
export function createStudyRoom(input: {
    name: string;
    type: "FREE" | "SUBJECT";
    disciplineName?: string;
    description?: string;
}): Promise<StudyRoom> {
    return requestJson<StudyRoom>("/api/study-rooms", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Adiciona um aluno a uma sala de estudo através do email.
 *
 * @param roomId Identificador da sala; o backend valida membership antes de expor dados.
 * @param email Email do aluno usado pelo backend para encontrar a conta certa.
 * @returns Sala atualizada com o novo membro, quando o backend autoriza.
 */
export function addStudyRoomMember(
    roomId: string,
    email: string,
): Promise<StudyRoom> {
    return requestJson<StudyRoom>(`/api/study-rooms/${roomId}/members`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

/**
 * Lista notas, URLs e referências de materiais partilhadas numa sala.
 *
 * @param roomId Identificador da sala; o backend valida membership antes de expor dados.
 * @returns Partilhas acessíveis aos membros da sala.
 */
export function listRoomShares(roomId: string): Promise<RoomShare[]> {
    return requestJson<RoomShare[]>(`/api/study-rooms/${roomId}/shares`);
}

/**
 * Cria uma partilha numa sala e marca se pode alimentar a IA coletiva.
 *
 * @param roomId Identificador da sala; o backend valida membership antes de expor dados.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Partilha criada com metadados de uso pela IA.
 */
export function createRoomShare(
    roomId: string,
    input: {
        type: "NOTE" | "URL" | "MATERIAL_REF";
        title: string;
        textContent?: string;
        url?: string;
        copiedText?: string;
        materialId?: string;
    },
): Promise<RoomShare> {
    return requestJson<RoomShare>(`/api/study-rooms/${roomId}/shares`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Pergunta à IA da sala usando apenas partilhas autorizadas como contexto.
 *
 * @param roomId Identificador da sala; o backend valida membership antes de expor dados.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Resposta da IA da sala com fontes usadas.
 */
export function askRoomAi(
    roomId: string,
    input: { question: string; sourceIds?: string[] },
): Promise<RoomAiAnswer> {
    return requestJson<RoomAiAnswer>(`/api/study-rooms/${roomId}/ai/answers`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Lista as turmas oficiais criadas pelo professor autenticado.
 * @returns Turmas geridas pelo professor atual.
 */
export function listTeacherClasses(): Promise<SchoolClass[]> {
    return requestJson<SchoolClass[]>("/api/teacher/classes");
}

/**
 * Cria uma turma oficial que depois pode receber alunos, disciplinas e materiais.
 *
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Turma criada com código normalizado pelo backend.
 */
export function createTeacherClass(input: {
    name: string;
    code: string;
    schoolYear: string;
}): Promise<SchoolClass> {
    return requestJson<SchoolClass>("/api/teacher/classes", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Inscreve um aluno numa turma oficial usando o email.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @param email Email do aluno usado pelo backend para encontrar a conta certa.
 * @returns Turma atualizada com o aluno inscrito.
 */
export function addClassStudent(
    classId: string,
    email: string,
): Promise<SchoolClass> {
    return requestJson<SchoolClass>(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

/**
 * Lista as turmas oficiais onde o aluno autenticado está inscrito.
 * @returns Turmas visíveis para o aluno atual.
 */
export function listStudentClasses(): Promise<SchoolClass[]> {
    return requestJson<SchoolClass[]>("/api/student/classes");
}

/**
 * Lista disciplinas de uma turma para o professor dono.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Disciplinas configuradas na turma.
 */
export function listSubjects(classId: string): Promise<Subject[]> {
    return requestJson<Subject[]>(`/api/teacher/classes/${classId}/subjects`);
}

/**
 * Lista disciplinas de uma turma acessíveis ao aluno inscrito.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Disciplinas visíveis para o aluno.
 */
export function listStudentSubjects(classId: string): Promise<Subject[]> {
    return requestJson<Subject[]>(`/api/student/classes/${classId}/subjects`);
}

/**
 * Cria uma disciplina dentro de uma turma do professor autenticado.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Disciplina criada e associada à turma.
 */
export function createSubject(
    classId: string,
    input: { name: string; code: string; description?: string },
): Promise<Subject> {
    return requestJson<Subject>(`/api/teacher/classes/${classId}/subjects`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Lista materiais oficiais de uma disciplina para gestão docente.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @returns Materiais oficiais da disciplina.
 */
export function listOfficialMaterials(
    subjectId: string,
): Promise<OfficialMaterial[]> {
    return requestJson<OfficialMaterial[]>(
        `/api/teacher/subjects/${subjectId}/materials`,
    );
}

/**
 * Cria material oficial textual ou URL para uma disciplina.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Material oficial criado e pronto para processamento ou referência.
 */
export function createOfficialMaterial(
    subjectId: string,
    input: {
        title: string;
        type: "TEXT" | "URL";
        textContent?: string;
        sourceUrl?: string;
    },
): Promise<OfficialMaterial> {
    return requestJson<OfficialMaterial>(
        `/api/teacher/subjects/${subjectId}/materials`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Obtém a voz pedagógica configurada pelo professor para a disciplina.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @returns Configuração atual da voz docente.
 */
export function getTeacherAiVoice(subjectId: string): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/subjects/${subjectId}/ai-voice`,
    );
}

/**
 * Atualiza tom, detalhe e regras que orientam a IA da disciplina.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Voz docente persistida para a disciplina.
 */
export function updateTeacherAiVoice(
    subjectId: string,
    input: {
        tone: TeacherAiVoice["tone"];
        detailLevel: TeacherAiVoice["detailLevel"];
        rules?: string[];
    },
): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/subjects/${subjectId}/ai-voice`,
        {
            method: "PUT",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Pergunta à IA da disciplina usando materiais oficiais e voz docente.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @param question Pergunta escrita pelo aluno e enviada ao backend para contexto IA controlado.
 * @returns Resposta da IA com fontes oficiais citáveis.
 */
export function askClassAi(
    subjectId: string,
    question: string,
): Promise<ClassAiAnswer> {
    return requestJson<ClassAiAnswer>(
        `/api/student/subjects/${subjectId}/ai/answers`,
        {
            method: "POST",
            body: JSON.stringify({ question }),
        },
    );
}

/**
 * Lista publicações de uma turma para o professor.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Avisos e posts da turma.
 */
export function listTeacherClassPosts(classId: string): Promise<ClassPost[]> {
    return requestJson<ClassPost[]>(`/api/teacher/classes/${classId}/posts`);
}

/**
 * Lista publicações visíveis ao aluno numa turma inscrita.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Avisos e posts disponíveis para o aluno.
 */
export function listStudentClassPosts(classId: string): Promise<ClassPost[]> {
    return requestJson<ClassPost[]>(`/api/student/classes/${classId}/posts`);
}

/**
 * Cria aviso ou publicação para alunos de uma turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Publicação criada pelo professor.
 */
export function createClassPost(
    classId: string,
    input: { type: "NOTICE" | "POST"; title: string; body: string },
): Promise<ClassPost> {
    return requestJson<ClassPost>(`/api/teacher/classes/${classId}/posts`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Lista salas de estudo guiado criadas pelo professor para uma turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Salas guiadas da turma.
 */
export function listTeacherGuidedStudyRooms(
    classId: string,
): Promise<GuidedStudyRoom[]> {
    return requestJson<GuidedStudyRoom[]>(
        `/api/teacher/classes/${classId}/guided-study-rooms`,
    );
}

/**
 * Lista salas de estudo guiado visíveis ao aluno inscrito numa turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Salas guiadas acessíveis ao aluno.
 */
export function listStudentGuidedStudyRooms(
    classId: string,
): Promise<GuidedStudyRoom[]> {
    return requestJson<GuidedStudyRoom[]>(
        `/api/student/classes/${classId}/guided-study-rooms`,
    );
}

/**
 * Cria uma sala guiada com objetivos e instruções docentes.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Sala guiada criada para a turma.
 */
export function createGuidedStudyRoom(
    classId: string,
    input: { title: string; description: string; materialIds?: string[] },
): Promise<GuidedStudyRoom> {
    return requestJson<GuidedStudyRoom>(
        `/api/teacher/classes/${classId}/guided-study-rooms`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Lista projetos de uma turma para gestão do professor.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Projetos existentes na turma.
 */
export function listTeacherClassProjects(
    classId: string,
): Promise<ClassProject[]> {
    return requestJson<ClassProject[]>(`/api/teacher/classes/${classId}/projects`);
}

/**
 * Lista projetos publicados para o aluno numa turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Projetos disponíveis para o aluno.
 */
export function listStudentClassProjects(
    classId: string,
): Promise<ClassProject[]> {
    return requestJson<ClassProject[]>(`/api/student/classes/${classId}/projects`);
}

/**
 * Cria projeto de turma com estado rascunho ou publicado.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Projeto criado no contexto da turma.
 */
export function createClassProject(
    classId: string,
    input: {
        title: string;
        brief: string;
        subject?: string;
        dueDate?: string;
        status?: "DRAFT" | "PUBLISHED";
    },
): Promise<ClassProject> {
    return requestJson<ClassProject>(`/api/teacher/classes/${classId}/projects`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Pede à IA um plano gradual para apoiar um projeto de turma.
 *
 * @param projectId Valor tipado usado para construir o pedido à API.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Plano estruturado com passos e checkpoints.
 */
export function createProjectAiPlan(
    projectId: string,
    input: { studentGoal: string; knownDifficulties?: string[] },
): Promise<ProjectAiPlan> {
    return requestJson<ProjectAiPlan>(
        `/api/student/projects/${projectId}/ai-plans`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Lista testes oficiais associados a uma disciplina.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @returns Testes ou mini-testes oficiais da disciplina.
 */
export function listOfficialTests(subjectId: string): Promise<OfficialTest[]> {
    return requestJson<OfficialTest[]>(`/api/teacher/subjects/${subjectId}/tests`);
}

/**
 * Cria teste oficial com perguntas de escolha múltipla.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Teste oficial criado pelo professor.
 */
export function createOfficialTest(
    subjectId: string,
    input: {
        title: string;
        description?: string;
        status?: "DRAFT" | "PUBLISHED";
        questions: OfficialTestQuestion[];
    },
): Promise<OfficialTest> {
    return requestJson<OfficialTest>(`/api/teacher/subjects/${subjectId}/tests`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Lista conteúdos IA pendentes ou decididos para revisão docente.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @returns Revisões de conteúdo IA da disciplina.
 */
export function listAiContentReviews(
    subjectId: string,
): Promise<AiContentReview[]> {
    return requestJson<AiContentReview[]>(
        `/api/teacher/subjects/${subjectId}/ai-content-reviews`,
    );
}

/**
 * Regista conteúdo gerado por IA para aprovação ou rejeição do professor.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Revisão criada em estado controlado.
 */
export function createAiContentReview(
    subjectId: string,
    input: {
        materialId: string;
        contentType: "SUMMARY" | "QUIZ";
        contentJson: Record<string, unknown>;
    },
): Promise<AiContentReview> {
    return requestJson<AiContentReview>(
        `/api/teacher/subjects/${subjectId}/ai-content-reviews`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Aprova ou rejeita uma revisão de conteúdo IA com comentário docente.
 *
 * @param reviewId Identificador da revisão de conteúdo IA a decidir.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Revisão atualizada com decisão auditável.
 */
export function decideAiContentReview(
    reviewId: string,
    input: { status: "APPROVED" | "REJECTED"; teacherComment?: string },
): Promise<AiContentReview> {
    return requestJson<AiContentReview>(
        `/api/teacher/ai-content-reviews/${reviewId}`,
        {
            method: "PATCH",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Obtém métricas agregadas de progresso de uma turma para o professor.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Resumo de progresso e notas da turma.
 */
export function getClassProgress(classId: string): Promise<ClassProgress> {
    return requestJson<ClassProgress>(`/api/teacher/classes/${classId}/progress`);
}

/**
 * Cria nota docente sobre progresso, dificuldade ou acompanhamento da turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Nota registada no painel de progresso.
 */
export function createClassProgressNote(
    classId: string,
    input: { title: string; note: string; difficultyTags?: string[] },
): Promise<ClassProgressNote> {
    return requestJson<ClassProgressNote>(
        `/api/teacher/classes/${classId}/progress/notes`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Inicia indexação textual de material privado do aluno.
 *
 * @param studyAreaId Identificador da área de estudo; o backend valida ownership.
 * @param materialId Identificador do material; nunca envia `userId` no body.
 * @returns Job QUEUED/PROCESSING/DONE/FAILED devolvido pela API.
 */
export function indexPrivateMaterial(
    studyAreaId: string,
    materialId: string,
): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(
        `/api/student/study-areas/${studyAreaId}/materials/${materialId}/index-jobs`,
        { method: "POST" },
    );
}

/**
 * Consulta o estado de um job de indexação autorizado.
 *
 * @param jobId Job devolvido pelo pedido inicial.
 * @returns Job com estado atualizado para a UI.
 */
export function getMaterialIndexJob(jobId: string): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(`/api/material-index-jobs/${jobId}`);
}

/**
 * Inicia indexação textual de material oficial da disciplina.
 *
 * @param materialId Identificador do material; o backend valida ownership ou ligação oficial antes de agir.
 * @returns Job de indexação oficial com estado e chunks quando disponíveis.
 */
export function indexOfficialMaterial(
    materialId: string,
): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(
        `/api/teacher/official-materials/${materialId}/index-jobs`,
        { method: "POST" },
    );
}

/**
 * Cria nova versão de material privado a partir de conteúdo submetido pelo aluno.
 *
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @param materialId Identificador do material; o backend valida ownership ou ligação oficial antes de agir.
 * @returns Versão privada criada e associada ao material.
 */
export function createPrivateMaterialVersion(
    studyAreaId: string,
    materialId: string,
): Promise<unknown> {
    return requestJson(
        `/api/student/study-areas/${studyAreaId}/materials/${materialId}/versions`,
        { method: "POST" },
    );
}

/**
 * Cria nova versão de material oficial para histórico docente.
 *
 * @param materialId Identificador do material; o backend valida ownership ou ligação oficial antes de agir.
 * @returns Versão oficial criada e associada ao material.
 */
export function createOfficialMaterialVersion(
    materialId: string,
): Promise<unknown> {
    return requestJson(`/api/teacher/official-materials/${materialId}/versions`, {
        method: "POST",
    });
}

/**
 * Cria versão a partir de um job de indexação concluído.
 *
 * @param jobId Identificador do job de indexação usado para versões, contexto ou leitura de chunks.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Versão ligada ao job que originou o texto.
 */
export function createMaterialVersionFromJob(
    jobId: string,
    input: { title?: string; changeSummary?: string },
): Promise<MaterialVersion> {
    return requestJson<MaterialVersion>(`/api/material-index-jobs/${jobId}/versions`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Lista histórico de versões criado para um job de indexação.
 *
 * @param jobId Identificador do job de indexação usado para versões, contexto ou leitura de chunks.
 * @returns Versões disponíveis para consulta ou restauro.
 */
export function listMaterialVersions(jobId: string): Promise<MaterialVersion[]> {
    return requestJson<MaterialVersion[]>(
        `/api/material-index-jobs/${jobId}/versions`,
    );
}

/**
 * Restaura uma versão anterior de material.
 *
 * @param jobId Identificador do job de indexação usado para versões, contexto ou leitura de chunks.
 * @param versionId Identificador da versão a restaurar no histórico do material.
 * @returns Versão restaurada segundo as regras do backend.
 */
export function restoreMaterialVersion(
    jobId: string,
    versionId: string,
): Promise<MaterialVersion> {
    return requestJson<MaterialVersion>(
        `/api/material-index-jobs/${jobId}/versions/${versionId}/restore`,
        { method: "PATCH" },
    );
}

/**
 * Lista contexto pedagógico de material privado numa área de estudo.
 *
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @returns Contextos privados autorizados para o aluno.
 */
export function listPrivateMaterialContext(
    studyAreaId: string,
): Promise<MaterialContextResponse> {
    return requestJson<MaterialContextResponse>(
        `/api/student/study-areas/${studyAreaId}/material-context`,
    );
}

/**
 * Lista contexto pedagógico de material oficial numa disciplina.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @returns Contextos oficiais disponíveis para professor ou aluno inscrito.
 */
export function listSubjectMaterialContext(
    subjectId: string,
): Promise<MaterialContextResponse> {
    return requestJson<MaterialContextResponse>(
        `/api/subjects/${subjectId}/material-context`,
    );
}

/**
 * Pergunta à IA privada da área usando apenas materiais do aluno.
 *
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @param question Pergunta escrita pelo aluno e enviada ao backend para contexto IA controlado.
 * @returns Resposta da IA privada com fontes autorizadas.
 */
export function askPrivateAreaAi(
    studyAreaId: string,
    question: string,
): Promise<PrivateAreaAiAnswer> {
    return requestJson<PrivateAreaAiAnswer>(
        `/api/student/study-areas/${studyAreaId}/private-ai/answers`,
        {
            method: "POST",
            body: JSON.stringify({ question }),
        },
    );
}

export type QuizGenerationJob = {
    _id: string;
    studyAreaId: string;
    status: "QUEUED" | "PROCESSING" | "DONE" | "FAILED";
    artifactId?: string;
    topic?: string;
    errorMessage?: string;
    createdAt?: string;
    updatedAt?: string;
};

/**
 * Inicia geração de quiz em background.
 *
 * @param studyAreaId Área privada do aluno autenticado.
 * @param input Tópico opcional; o backend escolhe fontes processáveis da área.
 * @returns Job inicial para polling.
 */
export function createQuizGenerationJob(
    studyAreaId: string,
    input: { topic?: string } = {},
): Promise<QuizGenerationJob> {
    return requestJson<QuizGenerationJob>(
        `/api/study-areas/${studyAreaId}/study-tools/quiz-jobs`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Consulta estado de geração de quiz.
 *
 * @param studyAreaId Área privada do aluno autenticado.
 * @param jobId Job devolvido pela criação.
 * @returns Estado público do job.
 */
export function getQuizGenerationJob(
    studyAreaId: string,
    jobId: string,
): Promise<QuizGenerationJob> {
    return requestJson<QuizGenerationJob>(
        `/api/study-areas/${studyAreaId}/study-tools/quiz-jobs/${jobId}`,
    );
}