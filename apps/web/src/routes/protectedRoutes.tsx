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
const Mf3CommunityPage = lazy(() =>
    import("../pages/student/Mf3CommunityPage.js").then((module) => ({
        default: module.Mf3CommunityPage,
    })),
);
const ProfilePage = lazy(() =>
    import("../pages/student/ProfilePage.js").then((module) => ({
        default: module.ProfilePage,
    })),
);
const RoomAiPage = lazy(() =>
    import("../pages/student/RoomAiPage.js").then((module) => ({
        default: module.RoomAiPage,
    })),
);
const RoomSharesPage = lazy(() =>
    import("../pages/student/RoomSharesPage.js").then((module) => ({
        default: module.RoomSharesPage,
    })),
);
const RoutinesPage = lazy(() =>
    import("../pages/student/RoutinesPage.js").then((module) => ({
        default: module.RoutinesPage,
    })),
);
const SoloStudyDashboard = lazy(() =>
    import("../pages/student/SoloStudyDashboard.js").then((module) => ({
        default: module.SoloStudyDashboard,
    })),
);
const StudentClassAiPage = lazy(() =>
    import("../pages/student/StudentClassAiPage.js").then((module) => ({
        default: module.StudentClassAiPage,
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
const StudentClassesPage = lazy(() =>
    import("../pages/student/StudentClassesPage.js").then((module) => ({
        default: module.StudentClassesPage,
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
const PrivateAreaAiPage = lazy(() =>
    import("../pages/student/PrivateAreaAiPage.js").then((module) => ({
        default: module.PrivateAreaAiPage,
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
const StudyAreasPage = lazy(() =>
    import("../pages/student/StudyAreasPage.js").then((module) => ({
        default: module.StudyAreasPage,
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
const StudyHistoryPage = lazy(() =>
    import("../pages/student/StudyHistoryPage.js").then((module) => ({
        default: module.StudyHistoryPage,
    })),
);
const StudyRoomsPage = lazy(() =>
    import("../pages/student/StudyRoomsPage.js").then((module) => ({
        default: module.StudyRoomsPage,
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

                    <Route path="/app/estudo" element={guarded(STUDENT, <SoloStudyDashboard />)} />
                    <Route path="/app/perfil" element={guarded(STUDENT, <ProfilePage />)} />
                    <Route path="/app/rotinas" element={guarded(STUDENT, <RoutinesPage />)} />
                    <Route path="/app/historico" element={guarded(STUDENT, <StudyHistoryPage />)} />
                    <Route path="/app/areas" element={guarded(STUDENT, <StudyAreasPage />)} />
                    <Route path="/app/salas" element={guarded(STUDENT, <StudyRoomsPage />)} />
                    <Route path="/app/comunidade" element={guarded(STUDENT, <Mf3CommunityPage />)} />
                    <Route path="/app/turmas" element={guarded(STUDENT, <StudentClassesPage />)} />
                    <Route path="/app/salas-guiadas" element={guarded(STUDENT, <StudentGuidedStudyRoomsPage />)} />
                    <Route path="/app/privacidade" element={guarded(ALL_ROLES, <PrivacyPage />)} />

                    <Route path="/app/salas/:roomId/ia" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <RoomAiPage roomId={roomId} />} />)} />
                    <Route path="/app/salas/:roomId" element={guarded(STUDENT, <ParamRoute names={["roomId"]} render={({ roomId }) => <RoomSharesPage roomId={roomId} />} />)} />
                    <Route path="/app/turmas/:classId/publicacoes" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentClassPostsPage classId={classId} />} />)} />
                    <Route path="/app/turmas/:classId/salas-guiadas/:roomId" element={guarded(STUDENT, <ParamRoute names={["classId", "roomId"]} render={({ classId, roomId }) => <StudentGuidedStudyRoomDetailPage classId={classId} roomId={roomId} />} />)} />
                    <Route path="/app/turmas/:classId/salas-guiadas" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentGuidedStudyRoomsPage classId={classId} />} />)} />
                    <Route path="/app/turmas/:classId/projectos" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentClassProjectsPage classId={classId} />} />)} />
                    <Route path="/app/projectos/:projectId/plano-ia" element={guarded(STUDENT, <ParamRoute names={["projectId"]} render={({ projectId }) => <ProjectAiPlanPage projectId={projectId} />} />)} />
                    <Route path="/app/turmas/:classId/disciplinas" element={guarded(STUDENT, <ParamRoute names={["classId"]} render={({ classId }) => <StudentClassSubjectsPage classId={classId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/ia" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentClassAiPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/chat" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentSubjectChatPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/testes" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <OfficialTestAttemptPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/conteudos-ia" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentApprovedAiContentPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/materiais/:materialId" element={guarded(STUDENT, <ParamRoute names={["subjectId", "materialId"]} render={({ subjectId, materialId }) => <StudentOfficialMaterialDetailPage materialId={materialId} subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:subjectId/materiais" element={guarded(STUDENT, <ParamRoute names={["subjectId"]} render={({ subjectId }) => <StudentOfficialMaterialsPage subjectId={subjectId} />} />)} />
                    <Route path="/app/disciplinas/:contextId/contextos-materiais" element={guarded(STUDENT, <ParamRoute names={["contextId"]} render={({ contextId }) => <MaterialContextsPage contextId={contextId} contextType="OFFICIAL_SUBJECT" />} />)} />
                    <Route path="/app/areas/:studyAreaId/adaptativo" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <AdaptiveLearningPage studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId/ia-privada" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <PrivateAreaAiPage studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:contextId/contextos-materiais" element={guarded(STUDENT, <ParamRoute names={["contextId"]} render={({ contextId }) => <MaterialContextsPage contextId={contextId} contextType="PRIVATE_AREA" />} />)} />
                    <Route path="/app/areas/:studyAreaId/materiais" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <StudyAreaMaterialsPage studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId/ferramentas" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <StudyToolsPage studyAreaId={studyAreaId} />} />)} />
                    <Route path="/app/areas/:studyAreaId" element={guarded(STUDENT, <ParamRoute names={["studyAreaId"]} render={({ studyAreaId }) => <StudyAreaDetailPage studyAreaId={studyAreaId} />} />)} />

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
