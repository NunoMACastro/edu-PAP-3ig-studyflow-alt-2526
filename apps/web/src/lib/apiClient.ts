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
};

/**
 * Resumo do estudo autónomo apresentado no dashboard do aluno.
 */
export type SoloStudyState = {
    studentName: string;
    hasOfficialClasses: boolean;
    officialClasses: StudentClassSummary[];
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
 * Formatos suportados pelo exportador MF8 para resumos e quizzes.
 */
export type ArtifactExportFormat = "md" | "pdf";

/**
 * Ficheiro textual devolvido pela API de exportação.
 */
export type ArtifactExportFile = {
    fileName: string;
    contentType: string;
    body: string;
    format: ArtifactExportFormat;
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
 * Job de geração de quiz em background, sem expor prompts nem conteúdo privado.
 */
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
    authorStudentId: string | null;
    type: "NOTE" | "URL" | "MATERIAL_REF";
    title: string | null;
    textContent?: string;
    url?: string;
    materialId?: string;
    materialTitle?: string;
    usableByAi: boolean;
    tombstoned?: boolean;
    tombstonedAt?: string;
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
 * Item privado do histórico da IA da sala.
 */
export type RoomAiHistoryItem = {
    _id: string;
    roomId: string;
    question: string;
    answer: string;
    createdAt?: string;
};

/**
 * Modos permitidos para reutilizar uma resposta IA da sala.
 */
export type RoomAiShareMode = "READ_ONLY" | "PRIVATE_FORK";

/**
 * Resposta IA partilhada ou cópia privada criada a partir de uma resposta partilhada.
 */
export type RoomAiSharedAnswer = {
    _id: string;
    roomId: string;
    studentId: string;
    question: string;
    answer: string;
    sourceShareIds: string[];
    visibility: "PRIVATE" | "SHARED";
    sharedAt?: string;
    forkedFromInteractionId?: string;
    createdAt?: string;
};

/**
 * Resultado da operação de partilha ou fork privado.
 */
export type RoomAiShareResult = {
    mode: RoomAiShareMode;
    answer: RoomAiSharedAnswer;
    createdPrivateCopy: boolean;
};

/**
 * Resumo público de um aluno inscrito numa turma.
 */
export type SchoolClassStudent = {
    id: string;
    email: string;
};

/**
 * Turma oficial criada por um professor e associada a alunos inscritos.
 */
export type SchoolClass = {
    _id: string;
    teacherId: string | null;
    name: string;
    code: string;
    schoolYear: string;
    status: "ACTIVE" | "ARCHIVED";
    archivedAt?: string;
    studentIds?: string[];
    students?: SchoolClassStudent[];
    createdAt?: string;
};

/** Resumo minimizado de uma turma devolvido ao aluno, sem IDs dos colegas. */
export type StudentClassSummary = Pick<
    SchoolClass,
    "_id" | "name" | "code" | "schoolYear" | "status" | "archivedAt" | "createdAt"
> & { joinedAt?: string };

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
    status: "ACTIVE" | "ARCHIVED";
    archivedAt?: string;
    createdAt?: string;
};

/** Disciplina minimizada para alunos, sem IDs internos do professor. */
export type StudentSubjectSummary = Pick<
    Subject,
    "_id" | "classId" | "name" | "code" | "description" | "status" | "archivedAt" | "createdAt"
> & { readOnly: boolean };

/**
 * Material oficial da disciplina, criado pelo professor e usado como fonte controlada.
 */
export type OfficialMaterial = {
    _id: string;
    subjectId: string;
    classId: string;
    teacherId: string;
    title: string;
    type: "TEXT" | "URL" | "PDF" | "DOCX";
    status: "PROCESSED" | "REFERENCE_ONLY" | "PENDING_PROCESSING";
    textContent?: string;
    sourceUrl?: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    availableToAi?: boolean;
    createdAt?: string;
};

/** Material oficial minimizado para consumo do aluno. */
export type StudentOfficialMaterial = {
    _id: string;
    subjectId: string;
    classId: string;
    title: string;
    type: "TEXT" | "URL" | "PDF" | "DOCX";
    status: "PROCESSED" | "REFERENCE_ONLY" | "PENDING_PROCESSING";
    textContent?: string;
    sourceUrl?: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    activeVersionId?: string;
    contentRevision: number;
    availableToAi: boolean;
    createdAt?: string;
};

export type StudentOfficialMaterialReference = Pick<
    StudentOfficialMaterial,
    "_id" | "subjectId" | "classId" | "title" | "type" | "status" | "sourceUrl"
>;

export type CursorPage<T> = {
    items: T[];
    nextCursor: string | null;
};

/**
 * Configuração da voz pedagógica que orienta a IA da turma ou disciplina.
 */
export type TeacherAiVoice = {
    _id?: string;
    scope: "CLASS" | "SUBJECT";
    source: "SUBJECT_OVERRIDE" | "CLASS_BASE" | "DEFAULT";
    hasOverride: boolean;
    subjectId?: string;
    classId: string;
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
    sources: StudentOfficialMaterialReference[];
    teacherVoiceApplied: boolean;
    createdAt?: string;
};

export type ClassAiAnswerPage = CursorPage<ClassAiAnswer>;

/**
 * Aviso ou publicação enviado pelo professor para a turma.
 */
export type ClassPost = {
    _id: string;
    classId: string;
    teacherId: string;
    type: "NOTICE" | "POST";
    title: string | null;
    body: string | null;
    tombstoned?: boolean;
    tombstonedAt?: string;
    createdAt?: string;
};

export type StudentClassPost = Omit<ClassPost, "teacherId">;

function parseStudentClassPost(value: unknown): StudentClassPost {
    const object = contractObject(value, "publicação de turma");
    contractString(object._id, "publicação._id");
    contractString(object.classId, "publicação.classId");
    contractString(object.type, "publicação.type");
    contractBoolean(object.tombstoned, "publicação.tombstoned");
    if ("teacherId" in object) {
        throw new TypeError("Publicação do aluno expõe identidade docente interna.");
    }
    return object as StudentClassPost;
}

/**
 * Sala de estudo guiado criada pelo professor para uma turma.
 */
export type GuidedStudyRoom = {
    _id: string;
    classId: string;
    subjectId?: string;
    teacherId: string;
    title: string;
    description: string;
    goal?: string;
    materialIds: string[];
    officialTestId?: string;
    startsAt?: string;
    durationMinutes?: number;
    aiEnabled: boolean;
    status: "OPEN" | "CLOSED";
    closedAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

/** Projeção segura da sala para o aluno, sem a identidade interna do professor. */
export type StudentGuidedStudyRoom = Omit<GuidedStudyRoom, "teacherId">;

export type StudentGuidedStudyRoomListItem = StudentGuidedStudyRoom & {
    className: string;
    subjectName?: string;
    myParticipation: GuidedStudyRoomParticipation | null;
};

export type StudentGuidedStudyRoomPage = CursorPage<StudentGuidedStudyRoomListItem>;

type GuidedStudyRoomDetailFields = {
    materials: StudentOfficialMaterial[];
    invalidMaterialIds: string[];
    officialTest?: Pick<OfficialTest, "_id" | "subjectId" | "title" | "status">;
    aiAvailable: boolean;
    myParticipation: GuidedStudyRoomParticipation | null;
};

export type GuidedStudyRoomDetail = GuidedStudyRoom & GuidedStudyRoomDetailFields;
export type StudentGuidedStudyRoomDetail = StudentGuidedStudyRoom & GuidedStudyRoomDetailFields;

export type GuidedStudyRoomParticipation = {
    id: string;
    roomId: string;
    classId: string;
    studentId: string;
    status: "VIEWED" | "COMPLETED";
    firstViewedAt: string;
    lastViewedAt: string;
    completedAt?: string;
};

export type GuidedStudyRoomProgress = {
    totalStudents: number;
    notViewed: number;
    viewed: number;
    completed: number;
    completionPercent: number;
    students: Array<{
        studentId: string;
        email: string;
        status: "NOT_VIEWED" | "VIEWED" | "COMPLETED";
        firstViewedAt?: string;
        lastViewedAt?: string;
        completedAt?: string;
    }>;
};

export type GuidedStudyRoomAiInteraction = {
    _id: string;
    roomId: string;
    classId: string;
    subjectId?: string;
    studentId: string;
    studentEmail: string;
    question: string;
    answer: string;
    sources: StudentOfficialMaterialReference[];
    teacherVoiceApplied: boolean;
    voice?: {
        source: TeacherAiVoice["source"];
        tone: TeacherAiVoice["tone"];
        detailLevel: TeacherAiVoice["detailLevel"];
        rules: string[];
    };
    createdAt?: string;
};

export type GuidedStudyRoomAiPage = {
    items: GuidedStudyRoomAiInteraction[];
    nextCursor: string | null;
};

export type GuidedStudyRoomInput = {
    title: string;
    description: string;
    goal?: string;
    subjectId?: string;
    materialIds: string[];
    officialTestId?: string;
    startsAt?: string;
    durationMinutes?: number;
    aiEnabled: boolean;
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
    subjectId?: string;
    subjectName?: string;
    subjectNameSnapshot?: string;
    dueDate?: string;
    status: "DRAFT" | "PUBLISHED";
    createdAt?: string;
};

export type StudentClassProject = Omit<ClassProject, "teacherId"> & {
    readOnly: boolean;
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
    teacherVoiceApplied: boolean;
    createdAt?: string;
};

export type ProjectAiPlanPage = CursorPage<ProjectAiPlan>;

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
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
    questions: OfficialTestQuestion[];
    createdAt?: string;
};

/**
 * Pergunta de teste oficial visível antes de o aluno submeter respostas.
 */
export type StudentOfficialTestQuestion = Omit<
    OfficialTestQuestion,
    "correctOptionIndex"
>;

/**
 * Mini-teste oficial publicado para um aluno inscrito.
 */
export type StudentOfficialTest = {
    _id: string;
    subjectId: string;
    title: string;
    description?: string;
    status: "PUBLISHED" | "CLOSED";
    questions: StudentOfficialTestQuestion[];
    attemptsUsed: number;
    attemptsRemaining: number;
    maxAttempts: 3;
    canSubmit: boolean;
    blockedReason: "TEST_CLOSED" | "ATTEMPT_LIMIT_REACHED" | null;
    latestAttempt?: OfficialTestAttempt | null;
    createdAt?: string;
};

/**
 * Correção calculada para uma pergunta da tentativa oficial do aluno.
 */
export type OfficialTestAttemptQuestionResult = {
    questionIndex: number;
    selectedOptionIndex: number;
    correctOptionIndex?: number;
    isCorrect?: boolean;
};

/**
 * Tentativa oficial persistida depois de o aluno submeter respostas.
 */
export type OfficialTestAttempt = {
    _id: string;
    testId: string;
    subjectId: string;
    classId: string;
    studentId: string;
    attemptNumber: number;
    attemptsRemaining: number;
    selectedOptionIndexes: number[];
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    solutionUnlocked: boolean;
    results: OfficialTestAttemptQuestionResult[];
    answeredAt: string;
};

/**
 * Linha de ranking docente de mini-testes oficiais.
 */
export type OfficialTestRankingRow = {
    position: number;
    studentRef: string;
    displayName: string;
    bestCorrectAnswers: number;
    bestTotalQuestions: number;
    bestPercentage: number;
    bestAnsweredAt: string;
    attemptCount: number;
};

/**
 * Ranking docente autorizado e filtrado pelo backend.
 */
export type OfficialTestRanking = {
    testId: string;
    subjectId: string;
    classId: string;
    policy: "BEST_ATTEMPT";
    rows: OfficialTestRankingRow[];
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
    materialTitle: string;
    materialStatus: "PROCESSED" | "REFERENCE_ONLY" | "PENDING_PROCESSING";
    decidedAt: string | null;
};

type ApprovedAiContentBase = {
    reviewId: string;
    subjectId: string;
    material: { id: string; title: string };
    approvedAt: string;
};

/** Conteúdo IA aprovado e minimizado para alunos inscritos. */
export type ApprovedAiContent =
    | (ApprovedAiContentBase & {
          contentType: "SUMMARY";
          content: { title?: string; text?: string; bullets?: string[] };
      })
    | (ApprovedAiContentBase & {
          contentType: "QUIZ";
          content: {
              title?: string;
              text?: string;
              questions?: Array<{
                  questionIndex: number;
                  question: string;
                  options: string[];
              }>;
          };
      });

/** Correção devolvida depois de persistir uma tentativa de quiz aprovado. */
export type ApprovedAiQuizAttemptResult = {
    attemptId?: string;
    attemptNumber?: number;
    reviewId: string;
    correctCount: number;
    totalQuestions: number;
    scorePercent: number;
    answeredAt: string;
    results: Array<{
        questionIndex: number;
        selectedOptionIndex: number;
        correctOptionIndex: number;
        isCorrect: boolean;
        explanation: string;
    }>;
};

/** Tentativa persistida e minimizada, sem chave nem explicações da correção. */
export type ApprovedAiQuizAttemptHistoryItem = {
    attemptId: string;
    reviewId: string;
    attemptNumber: number;
    selectedOptionIndexes: number[];
    correctCount: number;
    totalQuestions: number;
    scorePercent: number;
    answeredAt: string;
};

/**
 * Resumo factual da turma e respetivo registo docente append-only.
 */
export type TeacherClassSummary = {
    classId: string;
    className: string;
    studentsCount: number;
    subjectsCount: number;
    publishedTestsCount: number;
    approvedAiContentCount: number;
    postCount: number;
    noteCount: number;
    difficultyTags: string[];
    notes: ClassProgressNote[];
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
 * Totais globais apresentados no dashboard principal do professor.
 */
export type TeacherDashboardTotals = {
    classes: number;
    students: number;
    subjects: number;
    officialMaterials: number;
    publishedTests: number;
    pendingAiReviews: number;
    approvedAiReviews: number;
    posts: number;
    progressNotes: number;
    followUpRules: number;
    inactiveStudents: number;
};

/**
 * Sinais que ajudam o professor a decidir onde intervir primeiro.
 */
export type TeacherDashboardAttention = {
    classesWithoutSubjects: number;
    classesWithoutMaterials: number;
    classesWithLowActivity: number;
    classesWithoutFollowUpRules: number;
    pendingAiReviews: number;
    inactiveStudents: number;
};

/**
 * Resumo agregado de regras de acompanhamento.
 */
export type TeacherDashboardFollowUp = {
    rulesCount: number;
    classesWithRules: number;
    classesWithoutRules: number;
    inactiveStudentsCount: number;
};

export type TeacherDashboardActivityStatus = "SEM_BASE" | "BAIXA" | "REGULAR" | "ALTA";

/**
 * Detalhe compacto por disciplina mostrado apenas quando a turma é expandida no dashboard.
 */
export type TeacherDashboardSubjectRow = {
    subjectId: string;
    subjectName: string;
    subjectCode?: string;
    officialMaterialsCount: number;
    publishedTestsCount: number;
    pendingAiReviewsCount: number;
    openGuidedRoomsCount: number;
    closedGuidedRoomsCount: number;
};

/**
 * Linha agregada por turma no dashboard docente, sem dados pessoais de alunos.
 */
export type TeacherDashboardClassRow = {
    classId: string;
    className: string;
    studentsCount: number;
    subjectsCount: number;
    officialMaterialsCount: number;
    publishedTestsCount: number;
    approvedAiContentCount: number;
    pendingAiReviewsCount: number;
    postCount: number;
    noteCount: number;
    followUpRulesCount: number;
    inactiveStudentsCount: number;
    openGuidedRoomsCount: number;
    closedGuidedRoomsCount: number;
    guidedRoomCompletionsCount: number;
    activityScorePercent: number;
    activityStatus: TeacherDashboardActivityStatus;
    activityBasis: string[];
    difficultyTags: string[];
    subjects: TeacherDashboardSubjectRow[];
};

/**
 * Resumo principal do professor, agregando apenas dados já autorizados pela API.
 */
export type TeacherDashboardSummary = {
    totals: TeacherDashboardTotals;
    attention: TeacherDashboardAttention;
    followUp: TeacherDashboardFollowUp;
    classes: TeacherDashboardClassRow[];
    gaps: string[];
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
export const SESSION_UNAUTHORIZED_EVENT = "studyflow:session-unauthorized";

/**
 * Erro HTTP estruturado preservado entre o cliente e as páginas.
 *
 * O `status` permite distinguir sessão expirada, validação e indisponibilidade;
 * o `code` mantém o contrato estável devolvido pelo backend sem expor detalhes.
 */
export class ApiError extends Error {
    /**
     * Cria um erro tipado para uma resposta HTTP ou falha de rede.
     *
     * @param message Mensagem pública pronta a apresentar.
     * @param status Código HTTP, ou zero quando não existiu resposta.
     * @param code Código estável do domínio.
     * @param details Payload público original para diagnóstico controlado.
     */
    constructor(
        message: string,
        readonly status: number,
        readonly code: string,
        readonly details?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

/**
 * Indica se um valor é o erro estruturado do cliente HTTP.
 *
 * @param error Valor capturado por uma página ou hook.
 * @returns `true` quando contém status e código normalizados.
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Executa pedidos JSON partilhando cookies, CSRF, parsing e erros estruturados.
 *
 * @param path Caminho relativo começado por `/api`.
 * @param options Opções fetch adicionais.
 * @returns JSON parseado no tipo pedido pelo chamador.
 */
export async function requestJson<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await requestApiResponse(path, options);
    const rawBody = await response.text();
    return parseJsonBody(rawBody) as T;
}

/** Parser runtime usado para validar contratos públicos antes de os entregar à UI. */
export type ContractParser<T> = (value: unknown) => T;

/**
 * Executa um pedido JSON e rejeita respostas que não respeitam o contrato público.
 *
 * A validação fica junto da fronteira HTTP para impedir que casts TypeScript façam
 * payloads incompletos parecer válidos durante a execução.
 */
export async function requestContract<T>(
    path: string,
    parser: ContractParser<T>,
    options: RequestInit = {},
): Promise<T> {
    const payload = await requestJson<unknown>(path, options);
    try {
        return parser(payload);
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError(
            "O servidor devolveu dados incompatíveis com esta versão da aplicação.",
            502,
            "API_RESPONSE_INVALID",
            error,
        );
    }
}

function contractObject(value: unknown, label: string): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new TypeError(`${label} deve ser um objeto.`);
    }
    return value as Record<string, unknown>;
}

function contractString(
    value: unknown,
    label: string,
    options: { optional?: boolean } = {},
): string | undefined {
    if (value === undefined && options.optional) return undefined;
    if (typeof value !== "string") throw new TypeError(`${label} deve ser texto.`);
    return value;
}

function contractBoolean(value: unknown, label: string): boolean {
    if (typeof value !== "boolean") throw new TypeError(`${label} deve ser booleano.`);
    return value;
}

function contractArray<T>(
    value: unknown,
    label: string,
    parser: (item: unknown, index: number) => T,
): T[] {
    if (!Array.isArray(value)) throw new TypeError(`${label} deve ser uma lista.`);
    return value.map(parser);
}

function parseCursorPage<T>(
    value: unknown,
    itemParser: (item: unknown, index: number) => T,
): CursorPage<T> {
    const object = contractObject(value, "página");
    const nextCursor = object.nextCursor;
    if (nextCursor !== null && typeof nextCursor !== "string") {
        throw new TypeError("nextCursor deve ser texto ou null.");
    }
    return {
        items: contractArray(object.items, "items", itemParser),
        nextCursor,
    };
}

function parseStudentClassSummary(value: unknown): StudentClassSummary {
    const object = contractObject(value, "turma");
    const status = object.status;
    if (status !== "ACTIVE" && status !== "ARCHIVED") {
        throw new TypeError("Turma sem estado válido.");
    }
    contractString(object._id, "turma._id");
    contractString(object.name, "turma.name");
    contractString(object.code, "turma.code");
    contractString(object.schoolYear, "turma.schoolYear");
    return object as StudentClassSummary;
}

/** Valida a vista docente de uma turma devolvida pelos fluxos de lifecycle. */
function parseSchoolClass(value: unknown): SchoolClass {
    const object = contractObject(value, "turma docente");
    contractString(object._id, "turma._id");
    contractString(object.name, "turma.name");
    contractString(object.code, "turma.code");
    contractString(object.schoolYear, "turma.schoolYear");
    if (object.teacherId !== null) {
        contractString(object.teacherId, "turma.teacherId");
    }
    if (object.status !== "ACTIVE" && object.status !== "ARCHIVED") {
        throw new TypeError("Turma docente sem estado válido.");
    }
    if (
        object.studentIds !== undefined &&
        (!Array.isArray(object.studentIds) ||
            !object.studentIds.every((studentId) => typeof studentId === "string"))
    ) {
        throw new TypeError("turma.studentIds deve conter identificadores de alunos.");
    }
    if (object.students !== undefined) {
        contractArray(object.students, "turma.students", (student) => {
            const publicStudent = contractObject(student, "aluno da turma");
            contractString(publicStudent.id, "aluno.id");
            contractString(publicStudent.email, "aluno.email");
            return publicStudent as SchoolClassStudent;
        });
    }
    return object as SchoolClass;
}

/** Valida a vista docente de uma disciplina devolvida pelos fluxos de lifecycle. */
function parseTeacherSubject(value: unknown): Subject {
    const object = contractObject(value, "disciplina docente");
    contractString(object._id, "disciplina._id");
    contractString(object.classId, "disciplina.classId");
    contractString(object.teacherId, "disciplina.teacherId");
    contractString(object.name, "disciplina.name");
    contractString(object.code, "disciplina.code");
    if (object.status !== "ACTIVE" && object.status !== "ARCHIVED") {
        throw new TypeError("Disciplina docente sem estado válido.");
    }
    if (object.description !== undefined) {
        contractString(object.description, "disciplina.description");
    }
    return object as Subject;
}

function parseSoloStudyState(value: unknown): SoloStudyState {
    const object = contractObject(value, "estado de estudo autónomo");
    contractString(object.studentName, "estado.studentName");
    contractBoolean(object.hasOfficialClasses, "estado.hasOfficialClasses");
    const officialClasses = contractArray(
        object.officialClasses,
        "estado.officialClasses",
        parseStudentClassSummary,
    );
    for (const field of ["studyAreasCount", "routinesCount", "materialsCount"] as const) {
        if (typeof object[field] !== "number") throw new TypeError(`${field} deve ser número.`);
    }
    return { ...object, officialClasses } as SoloStudyState;
}

function parseSubject(value: unknown): StudentSubjectSummary {
    const object = contractObject(value, "disciplina");
    const status = object.status;
    if (status !== "ACTIVE" && status !== "ARCHIVED") {
        throw new TypeError("Disciplina sem estado válido.");
    }
    contractString(object._id, "disciplina._id");
    contractString(object.classId, "disciplina.classId");
    contractString(object.name, "disciplina.name");
    contractString(object.code, "disciplina.code");
    contractBoolean(object.readOnly, "disciplina.readOnly");
    return object as StudentSubjectSummary;
}

function parseStudentOfficialMaterial(value: unknown): StudentOfficialMaterial {
    const object = contractObject(value, "material oficial");
    contractString(object._id, "material._id");
    contractString(object.subjectId, "material.subjectId");
    contractString(object.classId, "material.classId");
    contractString(object.title, "material.title");
    if (!["TEXT", "URL", "PDF", "DOCX"].includes(String(object.type))) {
        throw new TypeError("Material sem tipo válido.");
    }
    if (
        object.status !== "PROCESSED" &&
        object.status !== "REFERENCE_ONLY" &&
        object.status !== "PENDING_PROCESSING"
    ) {
        throw new TypeError("Material sem estado válido.");
    }
    if (typeof object.contentRevision !== "number") {
        throw new TypeError("Material sem revisão válida.");
    }
    contractBoolean(object.availableToAi, "material.availableToAi");
    if ("teacherId" in object) {
        throw new TypeError("Material do aluno expõe identidade docente interna.");
    }
    return object as StudentOfficialMaterial;
}

function parseStudentOfficialMaterialReference(
    value: unknown,
): StudentOfficialMaterialReference {
    const object = contractObject(value, "referência de material oficial");
    contractString(object._id, "fonte._id");
    contractString(object.subjectId, "fonte.subjectId");
    contractString(object.classId, "fonte.classId");
    contractString(object.title, "fonte.title");
    if (!["TEXT", "URL", "PDF", "DOCX"].includes(String(object.type))) {
        throw new TypeError("Fonte sem tipo válido.");
    }
    if (
        object.status !== "PROCESSED" &&
        object.status !== "REFERENCE_ONLY" &&
        object.status !== "PENDING_PROCESSING"
    ) {
        throw new TypeError("Fonte sem estado válido.");
    }
    if ("teacherId" in object) {
        throw new TypeError("Fonte do aluno expõe identidade docente interna.");
    }
    return object as StudentOfficialMaterialReference;
}

function parseClassAiAnswer(value: unknown): ClassAiAnswer {
    const object = contractObject(value, "resposta IA");
    contractString(object._id, "resposta._id");
    contractString(object.subjectId, "resposta.subjectId");
    contractString(object.classId, "resposta.classId");
    contractString(object.question, "resposta.question");
    contractString(object.answer, "resposta.answer");
    contractBoolean(object.teacherVoiceApplied, "resposta.teacherVoiceApplied");
    const sources = contractArray(
        object.sources,
        "resposta.sources",
        parseStudentOfficialMaterialReference,
    );
    return { ...object, sources } as ClassAiAnswer;
}

function parseParticipation(value: unknown): GuidedStudyRoomParticipation {
    const object = contractObject(value, "participação");
    contractString(object.id, "participação.id");
    contractString(object.roomId, "participação.roomId");
    if (object.status !== "VIEWED" && object.status !== "COMPLETED") {
        throw new TypeError("Participação sem estado válido.");
    }
    contractString(object.firstViewedAt, "participação.firstViewedAt");
    contractString(object.lastViewedAt, "participação.lastViewedAt");
    return object as GuidedStudyRoomParticipation;
}

/** Valida os campos base comuns às vistas discentes de uma sala guiada. */
function parseStudentGuidedRoomBase(value: unknown): StudentGuidedStudyRoom {
    const object = contractObject(value, "sala guiada");
    contractString(object._id, "sala._id");
    contractString(object.classId, "sala.classId");
    contractString(object.title, "sala.title");
    contractString(object.description, "sala.description");
    contractArray(object.materialIds, "sala.materialIds", (materialId) =>
        contractString(materialId, "sala.materialId")!,
    );
    contractBoolean(object.aiEnabled, "sala.aiEnabled");
    if (object.status !== "OPEN" && object.status !== "CLOSED") {
        throw new TypeError("Sala sem estado válido.");
    }
    if ("teacherId" in object) {
        throw new TypeError("Sala guiada do aluno expõe identidade docente interna.");
    }
    return object as StudentGuidedStudyRoom;
}

function parseStudentGuidedRoom(value: unknown): StudentGuidedStudyRoomListItem {
    const object = parseStudentGuidedRoomBase(value) as StudentGuidedStudyRoomListItem;
    contractString(object.className, "sala.className");
    if (object.myParticipation !== null) parseParticipation(object.myParticipation);
    return object;
}

/** Valida o detalhe discente sem exigir os metadados exclusivos da lista global. */
function parseStudentGuidedRoomDetail(value: unknown): StudentGuidedStudyRoomDetail {
    const room = parseStudentGuidedRoomBase(value) as StudentGuidedStudyRoomDetail;
    const materials = contractArray(
        room.materials,
        "sala.materials",
        parseStudentOfficialMaterial,
    );
    contractArray(room.invalidMaterialIds, "sala.invalidMaterialIds", (materialId) =>
        contractString(materialId, "sala.invalidMaterialId")!,
    );
    contractBoolean(room.aiAvailable, "sala.aiAvailable");
    if (room.myParticipation !== null) parseParticipation(room.myParticipation);
    if (room.officialTest !== undefined) {
        const officialTest = contractObject(room.officialTest, "sala.officialTest");
        contractString(officialTest._id, "mini-teste._id");
        contractString(officialTest.subjectId, "mini-teste.subjectId");
        contractString(officialTest.title, "mini-teste.title");
        if (
            officialTest.status !== "DRAFT" &&
            officialTest.status !== "PUBLISHED" &&
            officialTest.status !== "CLOSED"
        ) {
            throw new TypeError("Mini-teste associado sem estado válido.");
        }
    }
    return { ...room, materials };
}

function parseGuidedAiInteraction(value: unknown): GuidedStudyRoomAiInteraction {
    const object = contractObject(value, "interação IA guiada");
    contractString(object._id, "interação._id");
    contractString(object.question, "interação.question");
    contractString(object.answer, "interação.answer");
    contractBoolean(object.teacherVoiceApplied, "interação.teacherVoiceApplied");
    const sources = contractArray(
        object.sources,
        "interação.sources",
        parseStudentOfficialMaterialReference,
    );
    return { ...object, sources } as GuidedStudyRoomAiInteraction;
}

function parseClassProject(value: unknown): ClassProject {
    const object = contractObject(value, "projeto");
    contractString(object._id, "projeto._id");
    contractString(object.classId, "projeto.classId");
    contractString(object.title, "projeto.title");
    contractString(object.brief, "projeto.brief");
    if (object.status !== "DRAFT" && object.status !== "PUBLISHED") {
        throw new TypeError("Projeto sem estado válido.");
    }
    return object as ClassProject;
}

function parseStudentClassProject(value: unknown): StudentClassProject {
    const object = parseClassProject(value) as unknown as Record<string, unknown>;
    contractBoolean(object.readOnly, "projeto.readOnly");
    if ("teacherId" in object) {
        throw new TypeError("Projeto do aluno expõe identidade docente interna.");
    }
    return object as unknown as StudentClassProject;
}

function parseProjectAiPlan(value: unknown): ProjectAiPlan {
    const object = contractObject(value, "plano IA");
    contractString(object._id, "plano._id");
    contractString(object.projectId, "plano.projectId");
    contractString(object.studentGoal, "plano.studentGoal");
    if (!Array.isArray(object.steps) || !object.steps.every((step) => typeof step === "string")) {
        throw new TypeError("Plano sem passos válidos.");
    }
    contractBoolean(object.teacherVoiceApplied, "plano.teacherVoiceApplied");
    return object as ProjectAiPlan;
}

function parseStudentOfficialTest(value: unknown): StudentOfficialTest {
    const object = contractObject(value, "mini-teste");
    contractString(object._id, "teste._id");
    contractString(object.subjectId, "teste.subjectId");
    contractString(object.title, "teste.title");
    if (object.status !== "PUBLISHED" && object.status !== "CLOSED") {
        throw new TypeError("Mini-teste sem estado válido.");
    }
    for (const field of ["attemptsUsed", "attemptsRemaining", "maxAttempts"] as const) {
        if (typeof object[field] !== "number") throw new TypeError(`${field} deve ser número.`);
    }
    contractBoolean(object.canSubmit, "teste.canSubmit");
    if (object.blockedReason !== null && object.blockedReason !== "TEST_CLOSED" && object.blockedReason !== "ATTEMPT_LIMIT_REACHED") {
        throw new TypeError("Mini-teste sem razão de bloqueio válida.");
    }
    if (!Array.isArray(object.questions)) throw new TypeError("Mini-teste sem perguntas válidas.");
    return object as StudentOfficialTest;
}

function contractFiniteNumber(value: unknown, label: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new TypeError(`${label} deve ser número.`);
    }
    return value;
}

function parseApprovedAiQuizAttemptHistoryItem(
    value: unknown,
): ApprovedAiQuizAttemptHistoryItem {
    const object = contractObject(value, "tentativa de quiz aprovado");
    contractString(object.attemptId, "tentativa.attemptId");
    contractString(object.reviewId, "tentativa.reviewId");
    contractString(object.answeredAt, "tentativa.answeredAt");
    for (const field of [
        "attemptNumber",
        "correctCount",
        "totalQuestions",
        "scorePercent",
    ] as const) {
        contractFiniteNumber(object[field], `tentativa.${field}`);
    }
    if (
        !Array.isArray(object.selectedOptionIndexes) ||
        !object.selectedOptionIndexes.every(Number.isInteger)
    ) {
        throw new TypeError("tentativa.selectedOptionIndexes deve conter inteiros.");
    }
    if (
        "results" in object ||
        "correctOptionIndexes" in object ||
        "explanations" in object
    ) {
        throw new TypeError("Histórico de tentativas expõe a chave da correção.");
    }
    return object as ApprovedAiQuizAttemptHistoryItem;
}

/** Projeta conteúdo IA aprovado para o shape seguro, sem decisão ou solução docente. */
function parseApprovedAiContent(value: unknown): ApprovedAiContent {
    const object = contractObject(value, "conteúdo IA aprovado");
    const reviewId = contractString(object.reviewId, "conteúdo.reviewId")!;
    const subjectId = contractString(object.subjectId, "conteúdo.subjectId")!;
    const approvedAt = contractString(object.approvedAt, "conteúdo.approvedAt")!;
    const materialObject = contractObject(object.material, "conteúdo.material");
    const material = {
        id: contractString(materialObject.id, "material.id")!,
        title: contractString(materialObject.title, "material.title")!,
    };
    for (const forbidden of [
        "teacherId",
        "teacherComment",
        "contentJson",
        "decidedAt",
    ]) {
        if (forbidden in object) {
            throw new TypeError(`Conteúdo aprovado expõe campo docente interno: ${forbidden}.`);
        }
    }
    const contentObject = contractObject(object.content, "conteúdo.content");
    const title = contentObject.title === undefined
        ? undefined
        : contractString(contentObject.title, "conteúdo.title");
    const text = contentObject.text === undefined
        ? undefined
        : contractString(contentObject.text, "conteúdo.text");

    if (object.contentType === "SUMMARY") {
        const bullets = contentObject.bullets === undefined
            ? undefined
            : contractArray(contentObject.bullets, "conteúdo.bullets", (bullet) =>
                  contractString(bullet, "conteúdo.bullet")!,
              );
        return {
            reviewId,
            subjectId,
            material,
            contentType: "SUMMARY",
            approvedAt,
            content: { title, text, bullets },
        };
    }
    if (object.contentType !== "QUIZ") {
        throw new TypeError("Conteúdo aprovado sem tipo válido.");
    }
    const questions = contentObject.questions === undefined
        ? undefined
        : contractArray(contentObject.questions, "conteúdo.questions", (question) => {
              const questionObject = contractObject(question, "pergunta aprovada");
              for (const forbidden of [
                  "correctOptionIndex",
                  "explanation",
                  "sourceMaterialIds",
              ]) {
                  if (forbidden in questionObject) {
                      throw new TypeError(`Pergunta aprovada expõe solução interna: ${forbidden}.`);
                  }
              }
              const questionIndex = contractFiniteNumber(
                  questionObject.questionIndex,
                  "pergunta.questionIndex",
              );
              if (!Number.isInteger(questionIndex) || questionIndex < 0) {
                  throw new TypeError("pergunta.questionIndex deve ser um inteiro não negativo.");
              }
              return {
                  questionIndex,
                  question: contractString(questionObject.question, "pergunta.question")!,
                  options: contractArray(questionObject.options, "pergunta.options", (option) =>
                      contractString(option, "pergunta.option")!,
                  ),
              };
          });
    return {
        reviewId,
        subjectId,
        material,
        contentType: "QUIZ",
        approvedAt,
        content: { title, text, questions },
    };
}

function parseApprovedAiQuizAttemptResult(
    value: unknown,
): ApprovedAiQuizAttemptResult {
    const object = contractObject(value, "resultado de quiz aprovado");
    if (object.attemptId !== undefined) {
        contractString(object.attemptId, "resultado.attemptId");
    }
    if (object.attemptNumber !== undefined) {
        contractFiniteNumber(object.attemptNumber, "resultado.attemptNumber");
    }
    contractString(object.reviewId, "resultado.reviewId");
    contractString(object.answeredAt, "resultado.answeredAt");
    for (const field of ["correctCount", "totalQuestions", "scorePercent"] as const) {
        contractFiniteNumber(object[field], `resultado.${field}`);
    }
    contractArray(object.results, "resultado.results", (entry, index) => {
        const result = contractObject(entry, `resultado.results[${index}]`);
        for (const field of [
            "questionIndex",
            "selectedOptionIndex",
            "correctOptionIndex",
        ] as const) {
            contractFiniteNumber(result[field], `resultado.results[${index}].${field}`);
        }
        contractBoolean(result.isCorrect, `resultado.results[${index}].isCorrect`);
        contractString(result.explanation, `resultado.results[${index}].explanation`);
        return result;
    });
    return object as ApprovedAiQuizAttemptResult;
}

/** Executa transporte HTTP comum também para multipart e downloads de texto. */
async function requestApiResponse(
    path: string,
    options: RequestInit = {},
): Promise<Response> {
    const headers = new Headers(options.headers);
    const isMultipart =
        typeof FormData !== "undefined" && options.body instanceof FormData;
    if (
        options.body !== undefined &&
        !isMultipart &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }
    // O CSRF marker permite usar cookies HttpOnly sem guardar tokens em localStorage.
    headers.set("x-studyflow-csrf", "1");

    let response: Response;
    try {
        response = await fetch(path, {
            ...options,
            // A sessão via cookie fica centralizada aqui para todas as chamadas tipadas da UI.
            credentials: "include",
            headers,
        });
    } catch (error) {
        throw new ApiError(
            "Não foi possível contactar o servidor. Tenta novamente.",
            0,
            "NETWORK_ERROR",
            error,
        );
    }

    if (!response.ok) {
        const rawBody = await response.text();
        const body = parseJsonBody(rawBody);
        if (
            response.status === 401 &&
            typeof window !== "undefined"
        ) {
            window.dispatchEvent(new Event(SESSION_UNAUTHORIZED_EVENT));
        }
        const publicError = normalizeErrorBody(body);
        throw new ApiError(
            publicError.message,
            response.status,
            publicError.code,
            body,
        );
    }
    return response;
}

/**
 * Tenta interpretar uma resposta JSON, aceitando corretamente respostas 204.
 *
 * @param rawBody Corpo textual já consumido uma única vez.
 * @returns Valor JSON, `undefined` para corpo vazio ou texto bruto inesperado.
 */
function parseJsonBody(rawBody: string): unknown {
    if (!rawBody) return undefined;
    try {
        return JSON.parse(rawBody) as unknown;
    } catch {
        return rawBody;
    }
}

/**
 * Normaliza os formatos de erro do Nest, incluindo arrays do ValidationPipe.
 *
 * @param body Corpo público devolvido pela API.
 * @returns Código e mensagem seguros e consistentes.
 */
function normalizeErrorBody(body: unknown): { code: string; message: string } {
    if (typeof body !== "object" || body === null) {
        return {
            code: "HTTP_ERROR",
            message: "Ocorreu um erro inesperado.",
        };
    }

    const payload = body as { code?: unknown; message?: unknown };
    const message = Array.isArray(payload.message)
        ? payload.message.filter((item): item is string => typeof item === "string").join(" ")
        : typeof payload.message === "string"
          ? payload.message
          : "Ocorreu um erro inesperado.";
    return {
        code: typeof payload.code === "string" ? payload.code : "HTTP_ERROR",
        message,
    };
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
    return requestContract("/api/study/solo", parseSoloStudyState);
}

/**
 * Obtém o dashboard principal do professor autenticado.
 *
 * @returns Totais, sinais de atenção e resumo por turma.
 */
export function getTeacherDashboard(): Promise<TeacherDashboardSummary> {
    return requestJson<TeacherDashboardSummary>("/api/teacher/dashboard");
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
 * Evento de histórico devolvido pela API de estudo.
 *
 * `occurredAt` chega ao browser como string ISO porque atravessa JSON.
 */
export type StudyHistoryEvent = {
    id: string;
    type:
        | "ROUTINE_CREATED"
        | "ROUTINE_ARCHIVED"
        | "GOAL_CREATED"
        | "GOAL_UPDATED"
        | "GOAL_ARCHIVED"
        | "STUDY_AREA_CREATED"
        | "MATERIAL_SUBMITTED"
        | "AI_PROFILE_CREATED"
        | "SUMMARY_GENERATED"
        | "STUDY_TOOL_GENERATED"
        | "ADAPTIVE_EXPLANATION_GENERATED"
        | "QUIZ_ATTEMPT_RECORDED";
    title: string;
    description?: string;
    occurredAt?: string;
};

/**
 * Lista eventos recentes de estudo do aluno autenticado.
 *
 * @returns Histórico privado do aluno com datas ISO serializadas.
 */
export function listStudyHistory(): Promise<StudyHistoryEvent[]> {
    return requestJson<StudyHistoryEvent[]>("/api/study/history");
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

    const response = await requestApiResponse(
        `/api/study-areas/${studyAreaId}/materials/file`,
        {
            method: "POST",
            body: formData,
        },
    );

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
    signal?: AbortSignal,
): Promise<QuizGenerationJob> {
    return requestJson<QuizGenerationJob>(
        `/api/study-areas/${studyAreaId}/study-tools/quiz-jobs/${jobId}`,
        { signal },
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
 * Exporta resumo ou quiz de uma área privada.
 *
 * @param studyAreaId Área privada do aluno autenticado.
 * @param artifactId Artefacto IA selecionado.
 * @param format Formato pedido pela UI.
 * @returns Ficheiro textual devolvido pelo backend.
 */
export async function exportStudyToolArtifact(
    studyAreaId: string,
    artifactId: string,
    format: ArtifactExportFormat,
): Promise<ArtifactExportFile> {
    const query = new URLSearchParams({ format });
    const response = await requestApiResponse(
        `/api/study-areas/${encodeURIComponent(
            studyAreaId,
        )}/study-tools/${encodeURIComponent(artifactId)}/export?${query}`,
        {
            method: "GET",
        },
    );
    return {
        fileName:
            readFileNameFromDisposition(
                response.headers.get("content-disposition"),
            ) ?? fallbackArtifactExportFileName(format),
        contentType: response.headers.get("content-type") ?? "text/plain",
        body: await response.text(),
        format,
    };
}

/**
 * Lê filename do header Content-Disposition.
 *
 * @param disposition Header recebido da API.
 * @returns Nome de ficheiro ou `undefined`.
 */
function readFileNameFromDisposition(
    disposition: string | null,
): string | undefined {
    if (!disposition) return undefined;
    const match = disposition.match(/filename="([^"]+)"/);
    return match?.[1];
}

/**
 * Define fallback de nome caso o proxy remova headers.
 *
 * @param format Formato pedido.
 * @returns Nome de ficheiro local.
 */
function fallbackArtifactExportFileName(format: ArtifactExportFormat): string {
    return format === "md"
        ? "studyflow-export.md"
        : "studyflow-export.html";
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
 * Lista o histórico privado da IA da sala para o aluno autenticado.
 *
 * @param roomId Identificador da sala; o backend valida membership e dono do histórico.
 * @returns Interações privadas ordenadas da mais recente para a mais antiga.
 */
export function listMyRoomAiHistory(roomId: string): Promise<RoomAiHistoryItem[]> {
    return requestJson<RoomAiHistoryItem[]>(
        `/api/study-rooms/${roomId}/ai/answers?scope=mine`,
    );
}

/**
 * Lista respostas IA partilhadas em read-only na sala.
 *
 * @param roomId Identificador da sala; o backend valida membership antes da leitura.
 * @returns Respostas partilhadas visíveis para membros da sala.
 */
export function listSharedRoomAiAnswers(roomId: string): Promise<RoomAiSharedAnswer[]> {
    return requestJson<RoomAiSharedAnswer[]>(
        `/api/study-rooms/${roomId}/ai/answers?scope=shared`,
    );
}

/**
 * Partilha uma resposta própria ou cria uma cópia privada de uma resposta partilhada.
 *
 * @param roomId Identificador da sala; o backend valida membership antes da operação.
 * @param answerId Identificador da resposta IA; ownership/visibilidade são validados no backend.
 * @param input Modo da operação.
 * @returns Resultado público devolvido pela API.
 */
export function shareRoomAiAnswer(
    roomId: string,
    answerId: string,
    input: { mode: RoomAiShareMode },
): Promise<RoomAiShareResult> {
    return requestJson<RoomAiShareResult>(
        `/api/study-rooms/${roomId}/ai/answers/${answerId}/share`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
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
    return requestContract("/api/teacher/classes", parseSchoolClass, {
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
    return requestContract(`/api/teacher/classes/${classId}/students`, parseSchoolClass, {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

/**
 * Remove a associação de um aluno a uma turma oficial sem apagar a conta do aluno.
 *
 * @param classId Identificador da turma; o backend valida ownership pelo professor autenticado.
 * @param studentId Identificador do aluno que deve deixar de estar associado à turma.
 * @returns Turma atualizada após a remoção.
 */
export function removeClassStudent(
    classId: string,
    studentId: string,
): Promise<SchoolClass> {
    return requestContract(
        `/api/teacher/classes/${classId}/students/${studentId}`,
        parseSchoolClass,
        {
            method: "DELETE",
        },
    );
}

/**
 * Lista as turmas oficiais onde o aluno autenticado está inscrito.
 * @returns Turmas visíveis para o aluno atual.
 */
export function listStudentClasses(
    status: SchoolClass["status"] = "ACTIVE",
): Promise<StudentClassSummary[]> {
    return requestContract(
        `/api/student/classes?status=${status}`,
        (value) => contractArray(value, "turmas", parseStudentClassSummary),
    );
}

/** Atualiza nome, código ou ano letivo de uma turma pertencente ao professor. */
export function updateTeacherClass(
    classId: string,
    input: { name?: string; code?: string; schoolYear?: string },
): Promise<SchoolClass> {
    return requestContract(`/api/teacher/classes/${classId}`, parseSchoolClass, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

/** Arquiva ou restaura uma turma sem apagar o histórico pedagógico. */
export function changeTeacherClassStatus(
    classId: string,
    status: SchoolClass["status"],
): Promise<SchoolClass> {
    return requestContract(`/api/teacher/classes/${classId}/status`, parseSchoolClass, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
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
export function listStudentSubjects(
    classId: string,
    status: Subject["status"] = "ACTIVE",
): Promise<StudentSubjectSummary[]> {
    return requestContract(
        `/api/student/classes/${classId}/subjects?status=${status}`,
        (value) => contractArray(value, "disciplinas", parseSubject),
    );
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
    return requestContract(`/api/teacher/classes/${classId}/subjects`, parseTeacherSubject, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/** Atualiza os metadados editáveis de uma disciplina. */
export function updateSubject(
    classId: string,
    subjectId: string,
    input: { name?: string; code?: string; description?: string },
): Promise<Subject> {
    return requestContract(
        `/api/teacher/classes/${classId}/subjects/${subjectId}`,
        parseTeacherSubject,
        { method: "PATCH", body: JSON.stringify(input) },
    );
}

/** Arquiva ou restaura uma disciplina preservando os recursos associados. */
export function changeSubjectStatus(
    classId: string,
    subjectId: string,
    status: Subject["status"],
): Promise<Subject> {
    return requestContract(
        `/api/teacher/classes/${classId}/subjects/${subjectId}/status`,
        parseTeacherSubject,
        { method: "PATCH", body: JSON.stringify({ status }) },
    );
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

/** Lista o catálogo oficial seguro e disponível ao aluno inscrito. */
export function listStudentOfficialMaterials(
    subjectId: string,
    input: { cursor?: string; limit?: number } = {},
): Promise<CursorPage<StudentOfficialMaterial>> {
    const query = new URLSearchParams();
    if (input.cursor) query.set("cursor", input.cursor);
    if (input.limit) query.set("limit", String(input.limit));
    const suffix = query.size ? `?${query.toString()}` : "";
    return requestContract(
        `/api/student/subjects/${subjectId}/materials${suffix}`,
        (value) => parseCursorPage(value, parseStudentOfficialMaterial),
    );
}

/** Obtém um material oficial seguro para leitura do aluno. */
export function getStudentOfficialMaterial(
    subjectId: string,
    materialId: string,
): Promise<StudentOfficialMaterial> {
    return requestContract(
        `/api/student/subjects/${subjectId}/materials/${materialId}`,
        parseStudentOfficialMaterial,
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

/** Submete PDF ou DOCX oficial via multipart sem enviar ownership. */
export async function uploadOfficialMaterialFile(
    subjectId: string,
    input: { title: string; file: File },
): Promise<OfficialMaterial> {
    const formData = new FormData();
    formData.append("title", input.title);
    formData.append("file", input.file);
    const response = await requestApiResponse(
        `/api/teacher/subjects/${subjectId}/materials/file`,
        { method: "POST", body: formData },
    );
    return response.json() as Promise<OfficialMaterial>;
}

/**
 * Obtém a voz pedagógica base configurada pelo professor para a turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono.
 * @returns Configuração atual da voz base da turma.
 */
export function getClassTeacherAiVoice(classId: string): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/classes/${classId}/ai-voice`,
    );
}

/**
 * Atualiza tom, detalhe e regras que orientam a IA da turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Voz docente persistida para a turma.
 */
export function updateClassTeacherAiVoice(
    classId: string,
    input: {
        tone: TeacherAiVoice["tone"];
        detailLevel: TeacherAiVoice["detailLevel"];
        rules?: string[];
    },
): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/classes/${classId}/ai-voice`,
        {
            method: "PUT",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Obtém a voz pedagógica efetiva da disciplina.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @returns Override da disciplina, voz herdada da turma ou defaults.
 */
export function getTeacherAiVoice(subjectId: string): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/subjects/${subjectId}/ai-voice`,
    );
}

/**
 * Atualiza tom, detalhe e regras que sobrepõem a voz herdada na disciplina.
 *
 * @param subjectId Identificador da disciplina; limita materiais, voz IA e testes ao contexto correto.
 * @param input Payload tipado enviado para a API; validação final continua no backend.
 * @returns Override da disciplina persistido.
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
 * Remove o override de voz da disciplina e volta a herdar da turma.
 *
 * @param subjectId Identificador da disciplina; o backend valida professor dono.
 * @returns Voz efetiva depois de remover o override.
 */
export function deleteTeacherAiVoiceOverride(
    subjectId: string,
): Promise<TeacherAiVoice> {
    return requestJson<TeacherAiVoice>(
        `/api/teacher/subjects/${subjectId}/ai-voice`,
        { method: "DELETE" },
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
    return requestContract(
        `/api/student/subjects/${subjectId}/ai/answers`,
        parseClassAiAnswer,
        {
            method: "POST",
            body: JSON.stringify({ question }),
        },
    );
}

/** Lista o histórico privado e paginado da IA da disciplina. */
export function listClassAiAnswers(
    subjectId: string,
    input: { cursor?: string; limit?: number } = {},
): Promise<ClassAiAnswerPage> {
    const query = new URLSearchParams();
    if (input.cursor) query.set("cursor", input.cursor);
    if (input.limit) query.set("limit", String(input.limit));
    const suffix = query.size ? `?${query.toString()}` : "";
    return requestContract(
        `/api/student/subjects/${subjectId}/ai/answers${suffix}`,
        (value) => parseCursorPage(value, parseClassAiAnswer),
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
export function listStudentClassPosts(classId: string): Promise<StudentClassPost[]> {
    return requestContract(
        `/api/student/classes/${classId}/posts`,
        (value) => contractArray(value, "publicações", parseStudentClassPost),
    );
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
    status: GuidedStudyRoom["status"] = "OPEN",
): Promise<StudentGuidedStudyRoomPage> {
    return requestContract(
        `/api/student/classes/${classId}/guided-study-rooms?status=${status}`,
        (value) => parseCursorPage(value, parseStudentGuidedRoom),
    );
}

/** Lista, entre todas as turmas, as salas guiadas acessíveis ao aluno. */
export function listAllStudentGuidedStudyRooms(
    input: {
        status?: GuidedStudyRoom["status"];
        cursor?: string;
        limit?: number;
        classId?: string;
    } = {},
): Promise<StudentGuidedStudyRoomPage> {
    const query = new URLSearchParams();
    query.set("status", input.status ?? "OPEN");
    if (input.cursor) query.set("cursor", input.cursor);
    if (input.limit) query.set("limit", String(input.limit));
    if (input.classId) query.set("classId", input.classId);
    return requestContract(
        `/api/student/guided-study-rooms?${query.toString()}`,
        (value) => parseCursorPage(value, parseStudentGuidedRoom),
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
    input: GuidedStudyRoomInput,
): Promise<GuidedStudyRoom> {
    return requestJson<GuidedStudyRoom>(
        `/api/teacher/classes/${classId}/guided-study-rooms`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

export function getTeacherGuidedStudyRoom(classId: string, roomId: string) {
    return requestJson<GuidedStudyRoomDetail>(
        `/api/teacher/classes/${classId}/guided-study-rooms/${roomId}`,
    );
}

export function getStudentGuidedStudyRoom(classId: string, roomId: string) {
    return requestContract(
        `/api/student/classes/${classId}/guided-study-rooms/${roomId}`,
        parseStudentGuidedRoomDetail,
    );
}

export function updateGuidedStudyRoom(
    classId: string,
    roomId: string,
    input: GuidedStudyRoomInput,
) {
    return requestJson<GuidedStudyRoom>(
        `/api/teacher/classes/${classId}/guided-study-rooms/${roomId}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                ...input,
                subjectId: input.subjectId ?? null,
                officialTestId: input.officialTestId ?? null,
                startsAt: input.startsAt ?? null,
                durationMinutes: input.durationMinutes ?? null,
            }),
        },
    );
}

export function changeGuidedStudyRoomStatus(
    classId: string,
    roomId: string,
    status: GuidedStudyRoom["status"],
) {
    return requestJson<GuidedStudyRoom>(
        `/api/teacher/classes/${classId}/guided-study-rooms/${roomId}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
    );
}

export function getGuidedStudyRoomProgress(classId: string, roomId: string) {
    return requestJson<GuidedStudyRoomProgress>(
        `/api/teacher/classes/${classId}/guided-study-rooms/${roomId}/progress`,
    );
}

export function markGuidedStudyRoomViewed(classId: string, roomId: string) {
    return requestContract(
        `/api/student/classes/${classId}/guided-study-rooms/${roomId}/participation/view`,
        parseParticipation,
        { method: "POST" },
    );
}

export function completeGuidedStudyRoom(classId: string, roomId: string) {
    return requestContract(
        `/api/student/classes/${classId}/guided-study-rooms/${roomId}/participation/complete`,
        parseParticipation,
        { method: "POST" },
    );
}

export function askGuidedStudyRoomAi(
    classId: string,
    roomId: string,
    question: string,
) {
    return requestContract(
        `/api/student/classes/${classId}/guided-study-rooms/${roomId}/ai/answers`,
        parseGuidedAiInteraction,
        { method: "POST", body: JSON.stringify({ question }) },
    );
}

export function listStudentGuidedStudyRoomAi(
    classId: string,
    roomId: string,
    cursor?: string,
) {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return requestContract(
        `/api/student/classes/${classId}/guided-study-rooms/${roomId}/ai/answers${query}`,
        (value) => parseCursorPage(value, parseGuidedAiInteraction),
    );
}

export function listTeacherGuidedStudyRoomAi(
    classId: string,
    roomId: string,
    input: { cursor?: string; studentId?: string } = {},
) {
    const query = new URLSearchParams();
    if (input.cursor) query.set("cursor", input.cursor);
    if (input.studentId) query.set("studentId", input.studentId);
    const suffix = query.size ? `?${query.toString()}` : "";
    return requestJson<GuidedStudyRoomAiPage>(
        `/api/teacher/classes/${classId}/guided-study-rooms/${roomId}/ai/interactions${suffix}`,
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
    return requestContract(
        `/api/teacher/classes/${classId}/projects`,
        (value) => contractArray(value, "projetos", parseClassProject),
    );
}

/**
 * Lista projetos publicados para o aluno numa turma.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Projetos disponíveis para o aluno.
 */
export function listStudentClassProjects(
    classId: string,
): Promise<StudentClassProject[]> {
    return requestContract(
        `/api/student/classes/${classId}/projects`,
        (value) => contractArray(value, "projetos", parseStudentClassProject),
    );
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
        subjectId?: string;
        dueDate?: string;
    },
): Promise<ClassProject> {
    return requestContract(`/api/teacher/classes/${classId}/projects`, parseClassProject, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/** Edita um projeto enquanto permanece em rascunho. */
export function updateClassProject(
    classId: string,
    projectId: string,
    input: { title?: string; brief?: string; subjectId?: string | null; dueDate?: string | null },
): Promise<ClassProject> {
    return requestContract(
        `/api/teacher/classes/${classId}/projects/${projectId}`,
        parseClassProject,
        { method: "PATCH", body: JSON.stringify(input) },
    );
}

/** Publica um rascunho de projeto de forma idempotente. */
export function publishClassProject(
    classId: string,
    projectId: string,
): Promise<ClassProject> {
    return requestContract(
        `/api/teacher/classes/${classId}/projects/${projectId}/publish`,
        parseClassProject,
        { method: "POST" },
    );
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
    return requestContract(
        `/api/student/projects/${projectId}/ai-plans`,
        parseProjectAiPlan,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/** Lista o histórico privado de planos IA criados para um projeto. */
export function listProjectAiPlans(
    projectId: string,
    input: { cursor?: string; limit?: number } = {},
): Promise<ProjectAiPlanPage> {
    const query = new URLSearchParams();
    if (input.cursor) query.set("cursor", input.cursor);
    if (input.limit) query.set("limit", String(input.limit));
    const suffix = query.size ? `?${query.toString()}` : "";
    return requestContract(
        `/api/student/projects/${projectId}/ai-plans${suffix}`,
        (value) => parseCursorPage(value, parseProjectAiPlan),
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
 * Obtém ranking docente de um mini-teste oficial.
 *
 * @param subjectId Disciplina do professor autenticado.
 * @param testId Mini-teste oficial.
 * @returns Ranking minimizado e autorizado pelo backend.
 */
export function getOfficialTestRanking(
    subjectId: string,
    testId: string,
): Promise<OfficialTestRanking> {
    return requestJson<OfficialTestRanking>(
        `/api/teacher/subjects/${subjectId}/tests/${testId}/ranking`,
    );
}

/**
 * Lista mini-testes oficiais publicados para o aluno autenticado.
 *
 * @param subjectId Disciplina oficial; o backend valida inscrição pela sessão.
 * @returns Mini-testes sem `correctOptionIndex` antes da submissão.
 */
export function listStudentOfficialTests(
    subjectId: string,
): Promise<StudentOfficialTest[]> {
    return requestContract(
        `/api/student/subjects/${subjectId}/tests`,
        (value) => contractArray(value, "mini-testes", parseStudentOfficialTest),
    );
}

/**
 * Submete respostas de um aluno para um mini-teste oficial publicado.
 *
 * @param subjectId Disciplina oficial; a sessão define o aluno real.
 * @param testId Mini-teste publicado.
 * @param input Índices escolhidos pelo aluno.
 * @returns Tentativa pontuada e persistida pelo backend.
 */
export function submitOfficialTestAttempt(
    subjectId: string,
    testId: string,
    input: { attemptKey: string; selectedOptionIndexes: number[] },
): Promise<OfficialTestAttempt> {
    return requestJson<OfficialTestAttempt>(
        `/api/student/subjects/${subjectId}/tests/${testId}/attempts`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

/**
 * Lista as tentativas do aluno atual e respeita o bloqueio de soluções da API.
 *
 * @param subjectId Disciplina oficial validada por membership.
 * @param testId Mini-teste publicado ou encerrado.
 * @returns Tentativas cronológicas do próprio aluno.
 */
export function listMyOfficialTestAttempts(
    subjectId: string,
    testId: string,
): Promise<OfficialTestAttempt[]> {
    return requestJson<OfficialTestAttempt[]>(
        `/api/student/subjects/${subjectId}/tests/${testId}/attempts/me`,
    );
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
        status?: "DRAFT";
        questions: OfficialTestQuestion[];
    },
): Promise<OfficialTest> {
    return requestJson<OfficialTest>(`/api/teacher/subjects/${subjectId}/tests`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

/**
 * Atualiza o conteúdo de um teste ainda em rascunho.
 */
export function updateOfficialTestDraft(
    subjectId: string,
    testId: string,
    input: {
        title: string;
        description?: string;
        status?: "DRAFT";
        questions: OfficialTestQuestion[];
    },
): Promise<OfficialTest> {
    return requestJson<OfficialTest>(
        `/api/teacher/subjects/${subjectId}/tests/${testId}`,
        { method: "PATCH", body: JSON.stringify(input) },
    );
}

/**
 * Avança um teste oficial um passo no ciclo de vida controlado pelo backend.
 *
 * @param subjectId Disciplina cujo ownership é validado pela API.
 * @param testId Teste a publicar ou encerrar.
 * @param status Estado de destino permitido pelo endpoint.
 * @returns Teste atualizado.
 */
export function changeOfficialTestStatus(
    subjectId: string,
    testId: string,
    status: "PUBLISHED" | "CLOSED",
): Promise<OfficialTest> {
    return requestJson<OfficialTest>(
        `/api/teacher/subjects/${subjectId}/tests/${testId}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({ status }),
        },
    );
}

/**
 * Publica um teste em rascunho através do endpoint de intenção explícita.
 */
export function publishOfficialTest(
    subjectId: string,
    testId: string,
): Promise<OfficialTest> {
    return requestJson<OfficialTest>(
        `/api/teacher/subjects/${subjectId}/tests/${testId}/publish`,
        { method: "POST" },
    );
}

/**
 * Encerra um teste publicado através do endpoint de intenção explícita.
 */
export function closeOfficialTest(
    subjectId: string,
    testId: string,
): Promise<OfficialTest> {
    return requestJson<OfficialTest>(
        `/api/teacher/subjects/${subjectId}/tests/${testId}/close`,
        { method: "POST" },
    );
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

/** Lista conteúdo IA atualmente aprovado para um aluno inscrito. */
export function listApprovedAiContent(
    subjectId: string,
): Promise<ApprovedAiContent[]> {
    return requestContract(
        `/api/student/subjects/${subjectId}/approved-ai-content`,
        (value) => contractArray(value, "conteúdos IA aprovados", parseApprovedAiContent),
    );
}

/** Corrige e guarda uma tentativa de quiz aprovado. */
export function submitApprovedAiQuizAttempt(
    subjectId: string,
    reviewId: string,
    selectedOptionIndexes: number[],
): Promise<ApprovedAiQuizAttemptResult> {
    return requestContract(
        `/api/student/subjects/${subjectId}/approved-ai-content/${reviewId}/quiz-attempts`,
        parseApprovedAiQuizAttemptResult,
        {
            method: "POST",
            body: JSON.stringify({ selectedOptionIndexes }),
        },
    );
}

/** Lista o histórico persistido do próprio aluno sem expor a chave do quiz. */
export function listApprovedAiQuizAttempts(
    subjectId: string,
    reviewId: string,
): Promise<ApprovedAiQuizAttemptHistoryItem[]> {
    return requestContract(
        `/api/student/subjects/${subjectId}/approved-ai-content/${reviewId}/quiz-attempts`,
        (value) => contractArray(
            value,
            "histórico de quizzes aprovados",
            parseApprovedAiQuizAttemptHistoryItem,
        ),
    );
}

/**
 * Obtém contexto factual e notas append-only de uma turma para o professor.
 *
 * @param classId Identificador da turma; o backend valida professor dono ou aluno inscrito.
 * @returns Resumo factual e notas da turma.
 */
export function getTeacherClassSummary(classId: string): Promise<TeacherClassSummary> {
    return requestJson<TeacherClassSummary>(`/api/teacher/classes/${classId}/progress`);
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
 * @param studyAreaId Identificador da área de estudo; garante que o pedido fica limitado ao espaço privado do aluno.
 * @param materialId Identificador do material; o backend valida ownership ou ligação oficial antes de agir.
 * @returns Job de indexação privado com estado e chunks quando disponíveis.
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
 * @param jobId Job devolvido pelo pedido inicial; o backend valida ownership.
 * @returns Job com estado atualizado para a UI.
 */
export function getMaterialIndexJob(
    jobId: string,
    signal?: AbortSignal,
): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(`/api/material-index-jobs/${jobId}`, {
        signal,
    });
}

/**
 * Reidrata o job privado mais recente de um material depois de reload.
 *
 * @param studyAreaId Área privada cujo ownership é revalidado pela API.
 * @param materialId Material alvo.
 * @returns Job mais recente, em qualquer estado.
 */
export function getLatestPrivateMaterialIndexJob(
    studyAreaId: string,
    materialId: string,
): Promise<MaterialIndexJob> {
    return requestJson<MaterialIndexJob>(
        `/api/student/study-areas/${studyAreaId}/materials/${materialId}/index-jobs/latest`,
    );
}

/** Reidrata o job mais recente de todos os materiais da área num pedido. */
export function listLatestPrivateMaterialIndexJobs(
    studyAreaId: string,
): Promise<MaterialIndexJob[]> {
    return requestJson<MaterialIndexJob[]>(
        `/api/student/study-areas/${studyAreaId}/material-index-jobs?latestByMaterial=true`,
    );
}

/** Reidrata o job mais recente dos materiais oficiais de uma disciplina. */
export function listLatestOfficialMaterialIndexJobs(
    subjectId: string,
): Promise<MaterialIndexJob[]> {
    return requestJson<MaterialIndexJob[]>(
        `/api/teacher/subjects/${subjectId}/material-index-jobs?latestByMaterial=true`,
    );
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
