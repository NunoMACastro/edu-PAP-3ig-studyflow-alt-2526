/**
 * Implementa a página do professor para chat da disciplina.
 */
import { SubjectChatPanel } from "../../features/subject-chat/SubjectChatPanel.js";

/**
 * Props da página de chat do professor.
 */
type TeacherSubjectChatPageProps = {
    subjectId: string;
};

/**
 * Página docente para conversa em tempo real com alunos inscritos na disciplina.
 *
 * @param props Disciplina alvo.
 * @returns Painel de chat autorizado.
 */
export function TeacherSubjectChatPage({ subjectId }: TeacherSubjectChatPageProps) {
    return <SubjectChatPanel role="TEACHER" subjectId={subjectId} />;
}
