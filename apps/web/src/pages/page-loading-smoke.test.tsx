/**
 * Valida o primeiro estado renderizado das rotas de produto contra respostas
 * mínimas, mas semanticamente válidas, da API.
 *
 * Estes testes apanham regressões frequentes de integração (por exemplo,
 * assumir que um array é um objeto ou que um campo opcional existe) sem
 * duplicar os testes E2E dos fluxos completos.
 */
import { act, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ActionFeedbackProvider } from "../features/mf5/action-feedback.js";

vi.mock("../lib/apiClient.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../lib/apiClient.js")>();

    const emptyTeacherDashboard = {
        totals: {
            classes: 0,
            students: 0,
            subjects: 0,
            officialMaterials: 0,
            publishedTests: 0,
            pendingAiReviews: 0,
            approvedAiReviews: 0,
            posts: 0,
            progressNotes: 0,
            followUpRules: 0,
            inactiveStudents: 0,
        },
        attention: {
            classesWithoutSubjects: 0,
            classesWithoutMaterials: 0,
            classesWithLowActivity: 0,
            classesWithoutFollowUpRules: 0,
            pendingAiReviews: 0,
            inactiveStudents: 0,
        },
        followUp: {
            rulesCount: 0,
            classesWithRules: 0,
            classesWithoutRules: 0,
            inactiveStudentsCount: 0,
        },
        classes: [],
        gaps: [],
    };

    const valuesByFunction: Record<string, unknown> = {
        getClassProgress: {
            classId: "class-id",
            className: "Turma de teste",
            studentsCount: 0,
            subjectsCount: 0,
            publishedTestsCount: 0,
            approvedAiContentCount: 0,
            postCount: 0,
            noteCount: 0,
            learningProgressPercent: null,
            learningProgressStatus: "PENDING_RESULTS_CONTRACT",
            activitySignalTotal: 0,
            activityCoveragePercent: 0,
            metricsBasis: "ACTIVITY_SIGNALS",
            difficultyTags: [],
            notes: [],
            gaps: [],
        },
        getClassTeacherAiVoice: {
            scope: "CLASS",
            source: "DEFAULT",
            hasOverride: false,
            classId: "class-id",
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        },
        getLearningProfile: {
            studyAreaId: "study-area-id",
            pace: "BALANCED",
            level: "BEGINNER",
            difficulties: [],
            preferredExplanationStyle: "PASSO_A_PASSO",
        },
        getOfficialTestRanking: {
            testId: "test-id",
            subjectId: "subject-id",
            classId: "class-id",
            policy: "BEST_ATTEMPT",
            rows: [],
        },
        getProfile: null,
        getSoloStudyState: {
            studentName: "Aluno",
            hasClass: false,
            className: null,
            studyAreasCount: 0,
            routinesCount: 0,
            materialsCount: 0,
        },
        getStudyArea: {
            _id: "study-area-id",
            name: "Área de teste",
            description: "Descrição",
            color: "#2563eb",
            voiceTone: "CALM",
            voiceDetailLevel: "BALANCED",
            voiceNotes: "",
        },
        getTeacherAiVoice: {
            scope: "SUBJECT",
            source: "DEFAULT",
            hasOverride: false,
            subjectId: "subject-id",
            classId: "class-id",
            tone: "CALM",
            detailLevel: "BALANCED",
            rules: [],
        },
        getTeacherDashboard: emptyTeacherDashboard,
        listPrivateMaterialContext: {
            context: "PRIVATE_AREA",
            studyAreaId: "study-area-id",
            materials: [],
            contexts: [],
        },
        listRoutines: { routines: [], goals: [] },
        listSubjectMaterialContext: {
            context: "OFFICIAL_SUBJECT",
            subjectId: "subject-id",
            materials: [],
            contexts: [],
        },
    };

    return Object.fromEntries(
        Object.entries(actual).map(([name, exportedValue]) => {
            if (
                typeof exportedValue !== "function" ||
                name === "ApiError" ||
                name === "isApiError" ||
                name === "requestJson"
            ) {
                return [name, exportedValue];
            }

            const defaultValue = Object.hasOwn(valuesByFunction, name)
                ? valuesByFunction[name]
                : name.startsWith("list")
                  ? []
                  : { ok: true };
            return [name, vi.fn().mockResolvedValue(defaultValue)];
        }),
    );
});

import { LoginPage } from "./auth/LoginPage.js";
import { RegisterPage } from "./auth/RegisterPage.js";
import { AdaptiveLearningPage } from "./student/AdaptiveLearningPage.js";
import { OfficialTestAttemptPage } from "./student/OfficialTestAttemptPage.js";
import { PrivateAreaAiPage } from "./student/PrivateAreaAiPage.js";
import { ProfilePage } from "./student/ProfilePage.js";
import { ProjectAiPlanPage } from "./student/ProjectAiPlanPage.js";
import { RoomAiPage } from "./student/RoomAiPage.js";
import { RoomSharesPage } from "./student/RoomSharesPage.js";
import { RoutinesPage } from "./student/RoutinesPage.js";
import { SoloStudyDashboard } from "./student/SoloStudyDashboard.js";
import { StudentClassAiPage } from "./student/StudentClassAiPage.js";
import { StudentClassPostsPage } from "./student/StudentClassPostsPage.js";
import { StudentClassProjectsPage } from "./student/StudentClassProjectsPage.js";
import { StudentClassesPage } from "./student/StudentClassesPage.js";
import { StudentClassSubjectsPage } from "./student/StudentClassSubjectsPage.js";
import { StudentGuidedStudyRoomsPage } from "./student/StudentGuidedStudyRoomsPage.js";
import { StudyAreaDetailPage } from "./student/StudyAreaDetailPage.js";
import { StudyAreaMaterialsPage } from "./student/StudyAreaMaterialsPage.js";
import { StudyAreasPage } from "./student/StudyAreasPage.js";
import { StudyHistoryPage } from "./student/StudyHistoryPage.js";
import { StudyRoomsPage } from "./student/StudyRoomsPage.js";
import { StudyToolsPage } from "./student/StudyToolsPage.js";
import { MaterialContextsPage } from "./shared/MaterialContextsPage.js";
import { MaterialVersionsPage } from "./shared/MaterialVersionsPage.js";
import { OfficialTestRankingPage } from "./teacher/OfficialTestRankingPage.js";
import { TeacherAiContentReviewsPage } from "./teacher/TeacherAiContentReviewsPage.js";
import { TeacherAiVoicePage } from "./teacher/TeacherAiVoicePage.js";
import { TeacherClassPostsPage } from "./teacher/TeacherClassPostsPage.js";
import { TeacherClassProgressPage } from "./teacher/TeacherClassProgressPage.js";
import { TeacherClassProjectsPage } from "./teacher/TeacherClassProjectsPage.js";
import { TeacherClassesPage } from "./teacher/TeacherClassesPage.js";
import { TeacherDashboardPage } from "./teacher/TeacherDashboardPage.js";
import { TeacherGuidedStudyRoomsPage } from "./teacher/TeacherGuidedStudyRoomsPage.js";
import { TeacherOfficialMaterialsPage } from "./teacher/TeacherOfficialMaterialsPage.js";
import { TeacherOfficialTestsPage } from "./teacher/TeacherOfficialTestsPage.js";
import { TeacherSubjectsPage } from "./teacher/TeacherSubjectsPage.js";

type RouteCase = {
    name: string;
    element: ReactElement;
    expectedText: RegExp;
};

const cases: RouteCase[] = [
    { name: "login", element: <LoginPage onLoggedIn={vi.fn()} />, expectedText: /Entrar/i },
    { name: "registo", element: <RegisterPage />, expectedText: /Registar/i },
    { name: "aprendizagem adaptativa", element: <AdaptiveLearningPage studyAreaId="study-area-id" />, expectedText: /aprendizagem adaptativa/i },
    { name: "tentativas oficiais", element: <OfficialTestAttemptPage subjectId="subject-id" />, expectedText: /mini-testes/i },
    { name: "IA privada", element: <PrivateAreaAiPage studyAreaId="study-area-id" />, expectedText: /IA privada/i },
    { name: "perfil", element: <ProfilePage />, expectedText: /perfil/i },
    { name: "plano de projeto", element: <ProjectAiPlanPage projectId="project-id" />, expectedText: /plano/i },
    { name: "IA da sala", element: <RoomAiPage roomId="room-id" />, expectedText: /IA da sala/i },
    { name: "partilhas", element: <RoomSharesPage roomId="room-id" />, expectedText: /partilhas/i },
    { name: "rotinas", element: <RoutinesPage />, expectedText: /rotinas/i },
    { name: "dashboard individual", element: <SoloStudyDashboard />, expectedText: /modo individual/i },
    { name: "IA da disciplina", element: <StudentClassAiPage subjectId="subject-id" />, expectedText: /IA da disciplina/i },
    { name: "posts do aluno", element: <StudentClassPostsPage classId="class-id" />, expectedText: /publicações/i },
    { name: "projetos do aluno", element: <StudentClassProjectsPage classId="class-id" />, expectedText: /projectos/i },
    { name: "turmas do aluno", element: <StudentClassesPage />, expectedText: /turmas/i },
    { name: "disciplinas do aluno", element: <StudentClassSubjectsPage classId="class-id" />, expectedText: /disciplinas/i },
    { name: "salas guiadas do aluno", element: <StudentGuidedStudyRoomsPage classId="class-id" />, expectedText: /salas/i },
    { name: "detalhe da área", element: <StudyAreaDetailPage studyAreaId="study-area-id" />, expectedText: /Área de teste/i },
    { name: "materiais da área", element: <StudyAreaMaterialsPage studyAreaId="study-area-id" />, expectedText: /materiais/i },
    { name: "áreas", element: <StudyAreasPage />, expectedText: /áreas/i },
    { name: "histórico", element: <StudyHistoryPage />, expectedText: /histórico/i },
    { name: "salas", element: <StudyRoomsPage />, expectedText: /salas/i },
    { name: "ferramentas de estudo", element: <StudyToolsPage studyAreaId="study-area-id" />, expectedText: /ferramentas/i },
    { name: "contextos privados", element: <MaterialContextsPage contextId="study-area-id" contextType="PRIVATE_AREA" />, expectedText: /contextos/i },
    { name: "versões", element: <MaterialVersionsPage jobId="job-id" />, expectedText: /versões/i },
    { name: "ranking", element: <OfficialTestRankingPage subjectId="subject-id" testId="test-id" />, expectedText: /ranking/i },
    { name: "revisões IA", element: <TeacherAiContentReviewsPage subjectId="subject-id" />, expectedText: /revisão/i },
    { name: "voz IA", element: <TeacherAiVoicePage subjectId="subject-id" />, expectedText: /voz/i },
    { name: "posts docente", element: <TeacherClassPostsPage classId="class-id" />, expectedText: /publicações/i },
    { name: "progresso", element: <TeacherClassProgressPage classId="class-id" />, expectedText: /progresso/i },
    { name: "projetos docente", element: <TeacherClassProjectsPage classId="class-id" />, expectedText: /projectos/i },
    { name: "turmas docente", element: <TeacherClassesPage />, expectedText: /turmas/i },
    { name: "dashboard docente", element: <TeacherDashboardPage />, expectedText: /dashboard docente/i },
    { name: "salas guiadas docente", element: <TeacherGuidedStudyRoomsPage classId="class-id" />, expectedText: /salas/i },
    { name: "materiais oficiais", element: <TeacherOfficialMaterialsPage subjectId="subject-id" />, expectedText: /materiais/i },
    { name: "mini-testes docente", element: <TeacherOfficialTestsPage subjectId="subject-id" />, expectedText: /testes oficiais/i },
    { name: "disciplinas docente", element: <TeacherSubjectsPage classId="class-id" />, expectedText: /disciplinas/i },
];

describe("estado inicial das páginas", () => {
    it.each(cases)("renderiza $name com respostas vazias autorizadas", async ({ element, expectedText }) => {
        const view = render(
            <MemoryRouter>
                <ActionFeedbackProvider>{element}</ActionFeedbackProvider>
            </MemoryRouter>,
        );

        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(view.container.textContent).toMatch(expectedText);
    });
});
