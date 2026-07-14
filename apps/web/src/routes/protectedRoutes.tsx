/**
 * Declara as rotas autenticadas com carregamento lazy e guards de role.
 *
 * Os guards evitam montar bundles de páginas incompatíveis com o papel atual;
 * a autorização e o ownership continuam sempre a ser decididos pelo backend.
 */
import { lazy, Suspense, type ReactNode } from "react";
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useParams,
} from "react-router-dom";
import { AppShell } from "../components/layout/AppShell.js";
import { getDefaultPathForRole } from "../components/layout/navigation.js";
import type { User } from "../lib/apiClient.js";
import { EmptyState, InlineNotice } from "../components/ui/CalmUi.js";

const AdminGovernancePage = lazy(() =>
    import("../pages/admin/AdminGovernancePage.js").then((module) => ({
        default: module.AdminGovernancePage,
    })),
);
const TeacherAiVoicePage = lazy(() =>
    import("../pages/teacher/TeacherAiVoicePage.js").then((module) => ({
        default: module.TeacherAiVoicePage,
    })),
);
const TeacherAiContentReviewsPage = lazy(() =>
    import("../pages/teacher/TeacherAiContentReviewsPage.js").then((module) => ({
        default: module.TeacherAiContentReviewsPage,
    })),
);
const TeacherClassesPage = lazy(() =>
    import("../pages/teacher/TeacherClassesPage.js").then((module) => ({
        default: module.TeacherClassesPage,
    })),
);
const TeacherClassPostsPage = lazy(() =>
    import("../pages/teacher/TeacherClassPostsPage.js").then((module) => ({
        default: module.TeacherClassPostsPage,
    })),
);
const TeacherClassProgressPage = lazy(() =>
    import("../pages/teacher/TeacherClassProgressPage.js").then((module) => ({
        default: module.TeacherClassProgressPage,
    })),
);
const TeacherClassProjectsPage = lazy(() =>
    import("../pages/teacher/TeacherClassProjectsPage.js").then((module) => ({
        default: module.TeacherClassProjectsPage,
    })),
);
const TeacherGuidedStudyRoomsPage = lazy(() =>
    import("../pages/teacher/TeacherGuidedStudyRoomsPage.js").then((module) => ({
        default: module.TeacherGuidedStudyRoomsPage,
    })),
);
const TeacherGuidedStudyRoomDetailPage = lazy(() =>
    import("../pages/teacher/TeacherGuidedStudyRoomDetailPage.js").then((module) => ({
        default: module.TeacherGuidedStudyRoomDetailPage,
    })),
);
const TeacherDashboardPage = lazy(() =>
    import("../pages/teacher/TeacherDashboardPage.js").then((module) => ({
        default: module.TeacherDashboardPage,
    })),
);
const TeacherOfficialMaterialsPage = lazy(() =>
    import("../pages/teacher/TeacherOfficialMaterialsPage.js").then((module) => ({
        default: module.TeacherOfficialMaterialsPage,
    })),
);
const OfficialTestRankingPage = lazy(() =>
    import("../pages/teacher/OfficialTestRankingPage.js").then((module) => ({
        default: module.OfficialTestRankingPage,
    })),
);
const TeacherOfficialTestsPage = lazy(() =>
    import("../pages/teacher/TeacherOfficialTestsPage.js").then((module) => ({
        default: module.TeacherOfficialTestsPage,
    })),
);
const TeacherFollowUpAlertsPage = lazy(() =>
    import("../pages/teacher/TeacherFollowUpAlertsPage.js").then((module) => ({
        default: module.TeacherFollowUpAlertsPage,
    })),
);
const TeacherSubjectChatPage = lazy(() =>
    import("../pages/teacher/TeacherSubjectChatPage.js").then((module) => ({
        default: module.TeacherSubjectChatPage,
    })),
);
const TeacherSubjectsPage = lazy(() =>
    import("../pages/teacher/TeacherSubjectsPage.js").then((module) => ({
        default: module.TeacherSubjectsPage,
    })),
);
const MaterialContextsPage = lazy(() =>
    import("../pages/shared/MaterialContextsPage.js").then((module) => ({
        default: module.MaterialContextsPage,
    })),
);
const MaterialVersionsPage = lazy(() =>
    import("../pages/shared/MaterialVersionsPage.js").then((module) => ({
        default: module.MaterialVersionsPage,
    })),
);
const AdaptiveLearningPage = lazy(() =>
    import("../pages/student/AdaptiveLearningPage.js").then((module) => ({
        default: module.AdaptiveLearningPage,
    })),
);
const StudentTodayPage = lazy(() => import("../pages/student/StudentTodayPage.js").then((module) => ({ default: module.StudentTodayPage })));
const StudentStudyHubPage = lazy(() => import("../pages/student/StudentStudyHubPage.js").then((module) => ({ default: module.StudentStudyHubPage })));
const StudentStudyMaterialsPage = lazy(() =>
    import("../pages/student/StudentStudyMaterialsPage.js").then((module) => ({
        default: module.StudentStudyMaterialsPage,
    })),
);
const StudentStudyMaterialDetailPage = lazy(() =>
    import("../pages/student/StudentStudyMaterialsPage.js").then((module) => ({
        default: module.StudentStudyMaterialDetailPage,
    })),
);
const StudentGroupHubPage = lazy(() => import("../pages/student/StudentGroupHubPage.js").then((module) => ({ default: module.StudentGroupHubPage })));
const StudentPlanPage = lazy(() => import("../pages/student/StudentPlanPage.js").then((module) => ({ default: module.StudentPlanPage })));
const StudentGroupWorkspacePage = lazy(() => import("../pages/student/StudentGroupWorkspacePage.js").then((module) => ({ default: module.StudentGroupWorkspacePage })));
const StudentNotificationPreferencesPage = lazy(() => import("../pages/student/StudentNotificationPreferencesPage.js").then((module) => ({ default: module.StudentNotificationPreferencesPage })));
const StudentSubjectOverviewPage = lazy(() => import("../pages/student/StudentSubjectOverviewPage.js").then((module) => ({ default: module.StudentSubjectOverviewPage })));
const StudentAssistantPage = lazy(() => import("../pages/student/StudentAssistantPage.js").then((module) => ({ default: module.StudentAssistantPage })));
const ProfilePage = lazy(() =>
    import("../pages/student/ProfilePage.js").then((module) => ({
        default: module.ProfilePage,
    })),
);
const StudentStudyRoomWorkspacePage = lazy(() =>
    import("../pages/student/StudentStudyRoomWorkspacePage.js").then((module) => ({
        default: module.StudentStudyRoomWorkspacePage,
    })),
);
const StudentClassPostsPage = lazy(() =>
    import("../pages/student/StudentClassPostsPage.js").then((module) => ({
        default: module.StudentClassPostsPage,
    })),
);
const StudentClassProjectsPage = lazy(() =>
    import("../pages/student/StudentClassProjectsPage.js").then((module) => ({
        default: module.StudentClassProjectsPage,
    })),
);
const StudentClassSubjectsPage = lazy(() =>
    import("../pages/student/StudentClassSubjectsPage.js").then((module) => ({
        default: module.StudentClassSubjectsPage,
    })),
);
const StudentApprovedAiContentPage = lazy(() =>
    import("../pages/student/StudentApprovedAiContentPage.js").then((module) => ({
        default: module.StudentApprovedAiContentPage,
    })),
);
const StudentSubjectPracticePage = lazy(() =>
    import("../pages/student/StudentSubjectPracticePage.js").then((module) => ({
        default: module.StudentSubjectPracticePage,
    })),
);
const StudentGuidedStudyRoomsPage = lazy(() =>
    import("../pages/student/StudentGuidedStudyRoomsPage.js").then((module) => ({
        default: module.StudentGuidedStudyRoomsPage,
    })),
);
const StudentGuidedStudyRoomDetailPage = lazy(() =>
    import("../pages/student/StudentGuidedStudyRoomDetailPage.js").then((module) => ({
        default: module.StudentGuidedStudyRoomDetailPage,
    })),
);
const StudentOfficialMaterialsPage = lazy(() =>
    import("../pages/student/StudentOfficialMaterialsPage.js").then((module) => ({
        default: module.StudentOfficialMaterialsPage,
    })),
);
const StudentOfficialMaterialDetailPage = lazy(() =>
    import("../pages/student/StudentOfficialMaterialsPage.js").then((module) => ({
        default: module.StudentOfficialMaterialDetailPage,
    })),
);
const StudentSubjectChatPage = lazy(() =>
    import("../pages/student/StudentSubjectChatPage.js").then((module) => ({
        default: module.StudentSubjectChatPage,
    })),
);
const OfficialTestAttemptPage = lazy(() =>
    import("../pages/student/OfficialTestAttemptPage.js").then((module) => ({
        default: module.OfficialTestAttemptPage,
    })),
);
const PrivacyPage = lazy(() =>
    import("../pages/student/PrivacyPage.js").then((module) => ({
        default: module.PrivacyPage,
    })),
);
const ProjectAiPlanPage = lazy(() =>
    import("../pages/student/ProjectAiPlanPage.js").then((module) => ({
        default: module.ProjectAiPlanPage,
    })),
);
const StudyAreaDetailPage = lazy(() =>
    import("../pages/student/StudyAreaDetailPage.js").then((module) => ({
        default: module.StudyAreaDetailPage,
    })),
);
const StudyAreaMaterialsPage = lazy(() =>
    import("../pages/student/StudyAreaMaterialsPage.js").then((module) => ({
        default: module.StudyAreaMaterialsPage,
    })),
);
const PrivateMarkdownMaterialPage = lazy(() =>
    import("../pages/student/PrivateMarkdownMaterialPage.js").then((module) => ({
        default: module.PrivateMarkdownMaterialPage,
    })),
);
const TeacherOfficialMarkdownPage = lazy(() =>
    import("../pages/teacher/TeacherOfficialMarkdownPage.js").then((module) => ({
        default: module.TeacherOfficialMarkdownPage,
    })),
);
const StudyToolsPage = lazy(() =>
    import("../pages/student/StudyToolsPage.js").then((module) => ({
        default: module.StudyToolsPage,
    })),
);

type ProtectedRoutesProps = {
    user: User;
    onLogout: () => Promise<void>;
};

const STUDENT: User["role"][] = ["STUDENT"];
const TEACHER: User["role"][] = ["TEACHER"];
const ADMIN: User["role"][] = ["ADMIN"];
const ALL_ROLES: User["role"][] = ["STUDENT", "TEACHER", "ADMIN"];

/**
 * Função pura usada pelo guard e pelos testes de matriz de acesso.
 *
 * @param role Papel devolvido pela sessão do backend.
 * @param allowedRoles Papéis que podem montar a página.
 * @returns `true` quando a rota é compatível com o papel atual.
 */
export function hasRouteAccess(
    role: User["role"],
    allowedRoles: readonly User["role"][],
): boolean {
    return allowedRoles.includes(role);
}

/**
 * Impede a montagem da página quando o papel não pertence à matriz da rota.
 *
 * @param props Papel atual, matriz e conteúdo lazy protegido.
 * @returns Conteúdo autorizado ou página 403.
 */
export function RoleGuard({
    role,
    allowedRoles,
    children,
}: {
    role: User["role"];
    allowedRoles: readonly User["role"][];
    children: ReactNode;
}) {
    return hasRouteAccess(role, allowedRoles) ? children : <ForbiddenPage />;
}

/**
 * Valida parâmetros dinâmicos antes de montar uma página de recurso.
 *
 * @param props Nomes exigidos e render function tipada por registo textual.
 * @returns Página parametrizada ou 404 quando falta um identificador.
 */
function ParamRoute({
    names,
    render,
}: {
    names: string[];
    render: (params: Record<string, string>) => ReactNode;
}) {
    const rawParams = useParams();
    const params: Record<string, string> = {};
    for (const name of names) {
        const value = rawParams[name];
        if (!value) return <NotFoundPage />;
        params[name] = value;
    }
    return render(params);
}

/**
 * Renderiza todas as páginas autenticadas dentro da shell comum.
 *
 * @param props Utilizador autenticado e logout canónico.
 * @returns Router declarativo com guards antes das páginas lazy.
 */
export function ProtectedRoutes({ user, onLogout }: ProtectedRoutesProps) {
    const homePath = getDefaultPathForRole(user.role);
    const guarded = (
        roles: readonly User["role"][],
        page: ReactNode,
    ): ReactNode => (
        <RoleGuard allowedRoles={roles} role={user.role}>
            {page}
        </RoleGuard>
    );

    return (
        <ProtectedLayout user={user} onLogout={onLogout}>
            <Suspense
                fallback={
                    <InlineNotice>A carregar página...</InlineNotice>
                }
            >
                <Routes>
                    <Route path="/" element={<Navigate replace to={homePath} />} />
                    <Route path="/login" element={<Navigate replace to={homePath} />} />
                    <Route path="/registar" element={<Navigate replace to={homePath} />} />
                    <Route path="/app" element={<Navigate replace to={homePath} />} />

                    <Route path="/app/hoje" element={guarded(STUDENT, <StudentTodayPage />)} />
                    <Route path="/app/estudar" element={guarded(STUDENT, <StudentStudyHubPage />)} />
                    <Route path="/app/estudar/materiais" element={guarded(STUDENT, <StudentStudyMaterialsPage />)} />
                    <Route path="/app/estudar/materiais/:artifactId" element={guarded(STUDENT, <ParamRoute names={["artifactId"]} render={({ artifactId }) => <StudentStudyMaterialDetailPage artifactId={artifactId} />} />)} />
                    <Route path="/app/em-grupo" element={guarded(STUDENT, <StudentGroupHubPage />)} />
                    <Route path="/app/plano" element={guarded(STUDENT, <StudentPlanPage />)} />
                    <Route path="/app/conta/notificacoes" element={guarded(STUDENT, <StudentNotificationPreferencesPage />)} />
                    <Route path="/app/assistente" element={guarded(STUDENT, <StudentAssistantPage />)} />
                    <Route path="/app/assistente/novo/:contextKind/:contextId" element={guarded(STUDENT, <StudentAssistantPage />)} />
                    <Route path="/app/assistente/:conversationId" element={guarded(STUDENT, <StudentAssistantPage />)} />

                    <Route path="/app/estudo" element={guarded(STUDENT, <LegacyRedirect to="/app/hoje" />)} />
                    <Route path="/app/perfil" element={guarded(STUDENT, <ProfilePage />)} />
                    <Route path="/app/rotinas" element={guarded(STUDENT, <LegacyRedirect to="/app/plano?tab=agenda" />)} />
                    <Route path="/app/historico" element={guarded(STUDENT, <LegacyRedirect to="/app/plano?tab=historico" />)} />
                    <Route path="/app/areas" element={guarded(STUDENT, <LegacyRedirect to="/app/estudar?vista=pessoal" />)} />
                    <Route path="/app/salas" element={guarded(STUDENT, <LegacyRedirect to="/app/em-grupo?vista=salas" />)} />
                    <Route path="/app/comunidade" element={guarded(STUDENT, <LegacyCommunityRedirect />)} />
                    <Route path="/app/turmas" element={guarded(STUDENT, <LegacyRedirect to="/app/estudar?vista=escola" />)} />
                    <Route path="/app/salas-guiadas" element={guarded(STUDENT, <LegacyRedirect to="/app/em-grupo?vista=professor" />)} />
                    <Route path="/app/privacidade" element={guarded(ALL_ROLES, <PrivacyPage />)} />

                    <Route path="/app/salas/:roomId/ia" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <LegacyRedirect to={`/app/assistente/novo/STUDY_ROOM/${roomId}`} />} />)} />
                    <Route path="/app/salas/:roomId/conversar" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <StudentStudyRoomWorkspacePage roomId={roomId} tab="conversar" />} />)} />
                    <Route path="/app/salas/:roomId/notas" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <StudentStudyRoomWorkspacePage roomId={roomId} tab="notas" />} />)} />
                    <Route path="/app/salas/:roomId/sessoes" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <StudentStudyRoomWorkspacePage roomId={roomId} tab="sessoes" />} />)} />
                    <Route path="/app/salas/:roomId/partilhas" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <StudentStudyRoomWorkspacePage roomId={roomId} tab="partilhas" />} />)} />
                    <Route path="/app/salas/:roomId" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <StudentStudyRoomWorkspacePage roomId={roomId} />} />)} />
                    <Route path="/app/turmas/:classId/publicacoes" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentClassPostsPage classId={classId} />} />)} />
                    <Route path="/app/turmas/:classId/salas-guiadas/:roomId" element={guarded(STUDENT, <ParamRoute names={["classId", "roomId"]} render={({ classId, roomId }) => <StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />} />)} />
                    <Route path="/app/turmas/:classId/salas-guiadas" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentGuidedStudyRoomsPage classId={classId} />} />)} />
                    <Route path="/app/turmas/:classId/projectos" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentClassProjectsPage classId={classId} />} />)} />
                    <Route path="/app/projectos/:projectId/plano-ia" element={guarded(STUDENT, <ParamRoute names={["projectId"]} render={({ projectId }) => <ProjectAiPlanPage projectId={projectId} />} />)} />
                    <Route path="/app/turmas/:classId/disciplinas" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentClassSubjectsPage classId={classId} />} />)} />
                    <Route path="/app/turmas/:classId/meus-materiais" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentStudyMaterialsPage targetId={classId} targetKind="CLASS" />} />)} />
                    <Route path="/app/disciplinas/:subjectId" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentSubjectOverviewPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/ia" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <LegacyRedirect to={`/app/assistente/novo/SUBJECT/${subjectId}`} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/chat" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentSubjectChatPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/praticar" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentSubjectPracticePage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/meus-materiais" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentStudyMaterialsPage targetId={subjectId} targetKind="SUBJECT" />} />)} />
                    <Route path="/app/disciplinas/:subjectId/testes" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <OfficialTestAttemptPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/conteudos-aprovados" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentApprovedAiContentPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/conteudos-ia" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <LegacyRedirect to={`/app/disciplinas/${subjectId}/conteudos-aprovados`} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/materiais/:materialId" element={guarded(STUDENT, <ParamRoute names={["subjectId", "materialId"]} render={({ subjectId, materialId }) => <StudentOfficialMaterialDetailPage materialId={materialId} subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/materiais" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentOfficialMaterialsPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:contextId/contextos-materiais" element={guarded(STUDENT, <ParamRoute names={["contextId"]} render={({ contextId }) => <MaterialContextsPage contextId={contextId} contextType="OFFICIAL_SUBJECT" />} />)} />
                    <Route path="/app/areas/:studyAreaId/adaptativo" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <AdaptiveLearningPage studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId/ia-privada" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <LegacyRedirect to={`/app/assistente/novo/STUDY_AREA/${studyAreaId}`} />} />)} />
                    <Route path="/app/areas/:contextId/contextos-materiais" element={guarded(STUDENT, <ParamRoute names={["contextId"]} render={({ contextId }) => <MaterialContextsPage contextId={contextId} contextType="PRIVATE_AREA" />} />)} />
                    <Route path="/app/areas/:studyAreaId/materiais/:materialId" element={guarded(STUDENT, <ParamRoute names={["studyAreaId", "materialId"]} render={({ studyAreaId, materialId }) => <PrivateMarkdownMaterialPage materialId={materialId} studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId/materiais" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <StudyAreaMaterialsPage studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId/ferramentas" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <StudyToolsPage studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId/definicoes" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <StudyAreaDetailPage settings studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <StudyAreaDetailPage studyAreaId={studyAreaId} />} />)} />

                    <Route path="/app/grupos/:groupId" element={guarded(STUDENT, <ParamRoute names={["groupId"]} render={({ groupId }) => <StudentGroupWorkspacePage groupId={groupId} />} />)} />
                    <Route path="/app/grupos/:groupId/mensagens" element={guarded(STUDENT, <ParamRoute names={["groupId"]} render={({ groupId }) => <StudentGroupWorkspacePage groupId={groupId} tab="mensagens" />} />)} />
                    <Route path="/app/grupos/:groupId/notas" element={guarded(STUDENT, <ParamRoute names={["groupId"]} render={({ groupId }) => <StudentGroupWorkspacePage groupId={groupId} tab="notas" />} />)} />
                    <Route path="/app/grupos/:groupId/sessoes" element={guarded(STUDENT, <ParamRoute names={["groupId"]} render={({ groupId }) => <StudentGroupWorkspacePage groupId={groupId} tab="sessoes" />} />)} />
                    <Route path="/app/grupos/:groupId/assistente" element={guarded(STUDENT, <ParamRoute names={["groupId"]} render={({ groupId }) => <LegacyRedirect to={`/app/assistente/novo/STUDY_GROUP/${groupId}`} />} />)} />

                    <Route path="/app/professor" element={guarded(TEACHER, <TeacherDashboardPage />)} />
                    <Route path="/app/professor/turmas" element={guarded(TEACHER, <TeacherClassesPage />)} />
                    <Route path="/app/professor/acompanhamento" element={guarded(TEACHER, <TeacherFollowUpAlertsPage />)} />
                    <Route path="/app/professor/turmas/:classId/disciplinas" element={guarded(TEACHER, <ParamRoute names={["classId"]} render={({ classId }) => <TeacherSubjectsPage classId={classId} />} />)} />
                    <Route path="/app/professor/turmas/:classId/voz" element={guarded(TEACHER, <ParamRoute names={["classId"]} render={({ classId }) => <TeacherClassesPage initialVoiceClassId={classId} />} />)} />
                    <Route path="/app/professor/turmas/:classId/publicacoes" element={guarded(TEACHER, <ParamRoute names={["classId"]} render={({ classId }) => <TeacherClassPostsPage classId={classId} />} />)} />
                    <Route path="/app/professor/turmas/:classId/salas-guiadas/:roomId" element={guarded(TEACHER, <ParamRoute names={["classId", "roomId"]} render={({ classId, roomId }) => <TeacherGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />} />)} />
                    <Route path="/app/professor/turmas/:classId/salas-guiadas" element={guarded(TEACHER, <ParamRoute names={["classId"]} render={({ classId }) => <TeacherGuidedStudyRoomsPage classId={classId} />} />)} />
                    <Route path="/app/professor/turmas/:classId/projectos" element={guarded(TEACHER, <ParamRoute names={["classId"]} render={({ classId }) => <TeacherClassProjectsPage classId={classId} />} />)} />
                    <Route path="/app/professor/turmas/:classId/progresso" element={guarded(TEACHER, <ParamRoute names={["classId"]} render={({ classId }) => <TeacherClassProgressPage classId={classId} />} />)} />
                    <Route path="/app/professor/disciplinas/:subjectId/materiais/:materialId" element={guarded(TEACHER, <ParamRoute names={["subjectId", "materialId"]} render={({ subjectId, materialId }) => <TeacherOfficialMarkdownPage materialId={materialId} subjectId={subjectId} />} />)} />
                    <Route path="/app/professor/disciplinas/:subjectId/materiais" element={guarded(TEACHER, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <TeacherOfficialMaterialsPage subjectId={subjectId} />} />)} />
                    <Route path="/app/professor/disciplinas/:subjectId/chat" element={guarded(TEACHER, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <TeacherSubjectChatPage subjectId={subjectId} />} />)} />
                    <Route path="/app/professor/disciplinas/:subjectId/testes/:testId/ranking" element={guarded(TEACHER, <ParamRoute names={["subjectId", "testId"]} render={({ subjectId, testId }) => <OfficialTestRankingPage subjectId={subjectId} testId={testId} />} />)} />
                    <Route path="/app/professor/disciplinas/:subjectId/testes" element={guarded(TEACHER, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <TeacherOfficialTestsPage subjectId={subjectId} />} />)} />
                    <Route path="/app/professor/disciplinas/:subjectId/revisoes-ia" element={guarded(TEACHER, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <TeacherAiContentReviewsPage subjectId={subjectId} />} />)} />
                    <Route path="/app/professor/disciplinas/:subjectId/voz" element={guarded(TEACHER, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <TeacherAiVoicePage subjectId={subjectId} />} />)} />
                    <Route path="/app/professor/disciplinas/:contextId/contextos-materiais" element={guarded(TEACHER, <ParamRoute names={["contextId"]} render={({ contextId }) => <MaterialContextsPage contextId={contextId} contextType="OFFICIAL_SUBJECT" />} />)} />

                    <Route path="/app/material-index-jobs/:jobId/versoes" element={guarded(["STUDENT", "TEACHER"], <ParamRoute names={["jobId"]} render={({ jobId }) => <MaterialVersionsPage jobId={jobId} />} />)} />
                    <Route path="/app/admin/governanca" element={guarded(ADMIN, <AdminGovernancePage />)} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </ProtectedLayout>
    );
}

/** Preserva parâmetros e hash relevantes ao encaminhar bookmarks antigos. */
function LegacyRedirect({ to }: { to: string }) {
    const location = useLocation();
    return <Navigate replace to={resolveLegacyStudentPath(to, location.search, location.hash)} />;
}

export function resolveLegacyStudentPath(to: string, search = "", hash = ""): string {
    const [pathname, presetQuery = ""] = to.split("?");
    const legacyParams = new URLSearchParams(search);
    const params = new URLSearchParams(presetQuery);
    legacyParams.forEach((value, key) => {
        if (!params.has(key)) params.set(key, value);
    });
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}${hash}`;
}

function LegacyCommunityRedirect() {
    const location = useLocation();
    return <Navigate replace to={resolveLegacyCommunityPath(location.search, location.hash)} />;
}

export function resolveLegacyCommunityPath(search = "", hash = ""): string {
    const groupId = new URLSearchParams(search).get("grupo");
    return groupId ? `/app/grupos/${groupId}${hash}` : `/app/em-grupo?vista=salas${hash}`;
}

/**
 * Layout único das rotas autenticadas; os guards são avaliados dentro desta shell.
 */
export function ProtectedLayout({
    user,
    onLogout,
    children,
}: ProtectedRoutesProps & { children: ReactNode }) {
    return (
        <AppShell user={user} onLogout={onLogout}>
            {children}
        </AppShell>
    );
}

/**
 * Página explícita para uma rota válida mas incompatível com o papel atual.
 *
 * @returns Estado 403 navegável e sem montar a página negada.
 */
export function ForbiddenPage() {
    return (
        <div className="max-w-2xl" role="alert">
            <EmptyState
                icon="shield"
                title="Acesso não permitido"
                description="Esta área não está disponível para o teu perfil. A API continuará a validar todas as permissões do recurso."
            />
        </div>
    );
}

/**
 * Página explícita para URLs autenticados sem correspondência.
 *
 * @returns Estado 404 em vez de esconder o erro com um dashboard.
 */
export function NotFoundPage() {
    return (
        <div className="max-w-2xl">
            <EmptyState
                icon="info"
                title="Página não encontrada"
                description="Confirma o endereço ou regressa através da navegação principal."
            />
        </div>
    );
}
