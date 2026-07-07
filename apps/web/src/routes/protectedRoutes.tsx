/**
 * Declara a navegação protegida e associa rotas as páginas autenticadas.
 */
import { AppShell } from "../components/layout/AppShell.js";
import { User } from "../lib/apiClient.js";
import { AdminGovernancePage } from "../pages/admin/AdminGovernancePage.js";
import {
    TeacherAiVoicePage,
    TeacherClassAiVoicePage,
} from "../pages/teacher/TeacherAiVoicePage.js";
import { TeacherAiContentReviewsPage } from "../pages/teacher/TeacherAiContentReviewsPage.js";
import { TeacherClassesPage } from "../pages/teacher/TeacherClassesPage.js";
import { TeacherClassPostsPage } from "../pages/teacher/TeacherClassPostsPage.js";
import { TeacherClassProgressPage } from "../pages/teacher/TeacherClassProgressPage.js";
import { TeacherClassProjectsPage } from "../pages/teacher/TeacherClassProjectsPage.js";
import { TeacherGuidedStudyRoomsPage } from "../pages/teacher/TeacherGuidedStudyRoomsPage.js";
import { TeacherOfficialMaterialsPage } from "../pages/teacher/TeacherOfficialMaterialsPage.js";
import { OfficialTestRankingPage } from "../pages/teacher/OfficialTestRankingPage.js";
import { TeacherOfficialTestsPage } from "../pages/teacher/TeacherOfficialTestsPage.js";
import { TeacherFollowUpAlertsPage } from "../pages/teacher/TeacherFollowUpAlertsPage.js";
import { TeacherSubjectsPage } from "../pages/teacher/TeacherSubjectsPage.js";
import { MaterialContextsPage } from "../pages/shared/MaterialContextsPage.js";
import { MaterialVersionsPage } from "../pages/shared/MaterialVersionsPage.js";
import { AdaptiveLearningPage } from "../pages/student/AdaptiveLearningPage.js";
import { Mf3CommunityPage } from "../pages/student/Mf3CommunityPage.js";
import { ProfilePage } from "../pages/student/ProfilePage.js";
import { RoomAiPage } from "../pages/student/RoomAiPage.js";
import { RoomSharesPage } from "../pages/student/RoomSharesPage.js";
import { RoutinesPage } from "../pages/student/RoutinesPage.js";
import { SoloStudyDashboard } from "../pages/student/SoloStudyDashboard.js";
import { StudentClassAiPage } from "../pages/student/StudentClassAiPage.js";
import { StudentClassPostsPage } from "../pages/student/StudentClassPostsPage.js";
import { StudentClassProjectsPage } from "../pages/student/StudentClassProjectsPage.js";
import { StudentClassSubjectsPage } from "../pages/student/StudentClassSubjectsPage.js";
import { StudentClassesPage } from "../pages/student/StudentClassesPage.js";
import { StudentGuidedStudyRoomsPage } from "../pages/student/StudentGuidedStudyRoomsPage.js";
import { PrivateAreaAiPage } from "../pages/student/PrivateAreaAiPage.js";
import { OfficialTestAttemptPage } from "../pages/student/OfficialTestAttemptPage.js";
import { PrivacyPage } from "../pages/student/PrivacyPage.js";
import { ProjectAiPlanPage } from "../pages/student/ProjectAiPlanPage.js";
import { StudyAreasPage } from "../pages/student/StudyAreasPage.js";
import { StudyAreaDetailPage } from "../pages/student/StudyAreaDetailPage.js";
import { StudyAreaMaterialsPage } from "../pages/student/StudyAreaMaterialsPage.js";
import { StudyHistoryPage } from "../pages/student/StudyHistoryPage.js";
import { StudyRoomsPage } from "../pages/student/StudyRoomsPage.js";
import { StudyToolsPage } from "../pages/student/StudyToolsPage.js";

/**
 * Props do componente React de rotas protegidas; mantêm explícitas as dependências vindas da página.
 */
type ProtectedRoutesProps = {
    user: User;
    onLogout: () => Promise<void>;
};

/**
 * Resolve a página protegida a partir do `window.location.pathname`.
 *
 * @param pathname Caminho atual do browser.
 * @returns Elemento React da página correspondente.
 */
function resolveProtectedPage(pathname: string) {
    const roomAiMatch = pathname.match(/^\/app\/salas\/([^/]+)\/ia$/);
    if (roomAiMatch) {
        return <RoomAiPage roomId={roomAiMatch[1]} />;
    }

    const roomSharesMatch = pathname.match(/^\/app\/salas\/([^/]+)$/);
    if (roomSharesMatch) {
        return <RoomSharesPage roomId={roomSharesMatch[1]} />;
    }

    const studentClassPostsMatch = pathname.match(/^\/app\/turmas\/([^/]+)\/publicacoes$/);
    if (studentClassPostsMatch) {
        return <StudentClassPostsPage classId={studentClassPostsMatch[1]} />;
    }

    const studentGuidedRoomsMatch = pathname.match(/^\/app\/turmas\/([^/]+)\/salas-guiadas$/);
    if (studentGuidedRoomsMatch) {
        return <StudentGuidedStudyRoomsPage classId={studentGuidedRoomsMatch[1]} />;
    }

    const studentProjectsMatch = pathname.match(/^\/app\/turmas\/([^/]+)\/projectos$/);
    if (studentProjectsMatch) {
        return <StudentClassProjectsPage classId={studentProjectsMatch[1]} />;
    }

    const projectAiPlanMatch = pathname.match(/^\/app\/projectos\/([^/]+)\/plano-ia$/);
    if (projectAiPlanMatch) {
        return <ProjectAiPlanPage projectId={projectAiPlanMatch[1]} />;
    }

    const studentClassSubjectsMatch = pathname.match(/^\/app\/turmas\/([^/]+)\/disciplinas$/);
    if (studentClassSubjectsMatch) {
        return <StudentClassSubjectsPage classId={studentClassSubjectsMatch[1]} />;
    }

    const classAiMatch = pathname.match(/^\/app\/disciplinas\/([^/]+)\/ia$/);
    if (classAiMatch) {
        return <StudentClassAiPage subjectId={classAiMatch[1]} />;
    }

    const studentOfficialTestsMatch = pathname.match(/^\/app\/disciplinas\/([^/]+)\/testes$/);
    if (studentOfficialTestsMatch) {
        return <OfficialTestAttemptPage subjectId={studentOfficialTestsMatch[1]} />;
    }

    const teacherClassSubjectsMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/disciplinas$/);
    if (teacherClassSubjectsMatch) {
        return <TeacherSubjectsPage classId={teacherClassSubjectsMatch[1]} />;
    }

    const teacherClassVoiceMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/voz$/);
    if (teacherClassVoiceMatch) {
        return <TeacherClassAiVoicePage classId={teacherClassVoiceMatch[1]} />;
    }

    const teacherClassPostsMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/publicacoes$/);
    if (teacherClassPostsMatch) {
        return <TeacherClassPostsPage classId={teacherClassPostsMatch[1]} />;
    }

    const teacherGuidedRoomsMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/salas-guiadas$/);
    if (teacherGuidedRoomsMatch) {
        return <TeacherGuidedStudyRoomsPage classId={teacherGuidedRoomsMatch[1]} />;
    }

    const teacherProjectsMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/projectos$/);
    if (teacherProjectsMatch) {
        return <TeacherClassProjectsPage classId={teacherProjectsMatch[1]} />;
    }

    const teacherProgressMatch = pathname.match(/^\/app\/professor\/turmas\/([^/]+)\/progresso$/);
    if (teacherProgressMatch) {
        return <TeacherClassProgressPage classId={teacherProgressMatch[1]} />;
    }

    const teacherMaterialsMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/materiais$/);
    if (teacherMaterialsMatch) {
        return <TeacherOfficialMaterialsPage subjectId={teacherMaterialsMatch[1]} />;
    }

    const teacherTestRankingMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/testes\/([^/]+)\/ranking$/);
    if (teacherTestRankingMatch) {
        return (
            <OfficialTestRankingPage
                subjectId={teacherTestRankingMatch[1]}
                testId={teacherTestRankingMatch[2]}
            />
        );
    }

    const teacherTestsMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/testes$/);
    if (teacherTestsMatch) {
        return <TeacherOfficialTestsPage subjectId={teacherTestsMatch[1]} />;
    }

    const teacherReviewsMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/revisoes-ia$/);
    if (teacherReviewsMatch) {
        return <TeacherAiContentReviewsPage subjectId={teacherReviewsMatch[1]} />;
    }

    const teacherVoiceMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/voz$/);
    if (teacherVoiceMatch) {
        return <TeacherAiVoicePage subjectId={teacherVoiceMatch[1]} />;
    }

    const teacherSubjectContextsMatch = pathname.match(/^\/app\/professor\/disciplinas\/([^/]+)\/contextos-materiais$/);
    if (teacherSubjectContextsMatch) {
        return (
            <MaterialContextsPage
                contextId={teacherSubjectContextsMatch[1]}
                contextType="OFFICIAL_SUBJECT"
            />
        );
    }

    const materialVersionsMatch = pathname.match(/^\/app\/material-index-jobs\/([^/]+)\/versoes$/);
    if (materialVersionsMatch) {
        return <MaterialVersionsPage jobId={materialVersionsMatch[1]} />;
    }

    const adaptiveMatch = pathname.match(/^\/app\/areas\/([^/]+)\/adaptativo$/);
    if (adaptiveMatch) {
        return <AdaptiveLearningPage studyAreaId={adaptiveMatch[1]} />;
    }

    const privateAiMatch = pathname.match(/^\/app\/areas\/([^/]+)\/ia-privada$/);
    if (privateAiMatch) {
        return <PrivateAreaAiPage studyAreaId={privateAiMatch[1]} />;
    }

    const privateContextsMatch = pathname.match(/^\/app\/areas\/([^/]+)\/contextos-materiais$/);
    if (privateContextsMatch) {
        return (
            <MaterialContextsPage
                contextId={privateContextsMatch[1]}
                contextType="PRIVATE_AREA"
            />
        );
    }

    const subjectContextsMatch = pathname.match(/^\/app\/disciplinas\/([^/]+)\/contextos-materiais$/);
    if (subjectContextsMatch) {
        return (
            <MaterialContextsPage
                contextId={subjectContextsMatch[1]}
                contextType="OFFICIAL_SUBJECT"
            />
        );
    }

    const materialMatch = pathname.match(/^\/app\/areas\/([^/]+)\/materiais$/);
    if (materialMatch) {
        return <StudyAreaMaterialsPage studyAreaId={materialMatch[1]} />;
    }

    const toolsMatch = pathname.match(/^\/app\/areas\/([^/]+)\/ferramentas$/);
    if (toolsMatch) {
        return <StudyToolsPage studyAreaId={toolsMatch[1]} />;
    }

    const areaMatch = pathname.match(/^\/app\/areas\/([^/]+)$/);
    if (areaMatch) {
        return <StudyAreaDetailPage studyAreaId={areaMatch[1]} />;
    }

    if (pathname === "/app/perfil") return <ProfilePage />;
    if (pathname === "/app/privacidade") return <PrivacyPage />;
    if (pathname === "/app/rotinas") return <RoutinesPage />;
    if (pathname === "/app/historico") return <StudyHistoryPage />;
    if (pathname === "/app/areas") return <StudyAreasPage />;
    if (pathname === "/app/salas") return <StudyRoomsPage />;
    if (pathname === "/app/comunidade") return <Mf3CommunityPage />;
    if (pathname === "/app/turmas") return <StudentClassesPage />;
    if (pathname === "/app/professor/turmas") return <TeacherClassesPage />;
    if (pathname === "/app/professor/acompanhamento") return <TeacherFollowUpAlertsPage />;
    if (pathname === "/app/admin/governanca") return <AdminGovernancePage />;
    return <SoloStudyDashboard />;
}

/**
 * Renderiza páginas protegidas dentro da shell comum.
 *
 * @param props Utilizador autenticado e logout.
 * @returns Página protegida atual.
 */
export function ProtectedRoutes({ user, onLogout }: ProtectedRoutesProps) {
    return (
        <AppShell user={user} onLogout={onLogout}>
            {resolveProtectedPage(window.location.pathname)}
        </AppShell>
    );
}
