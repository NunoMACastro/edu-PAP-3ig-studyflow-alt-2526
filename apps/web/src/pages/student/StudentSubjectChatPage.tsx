/**
 * Implementa a página do aluno para chat da disciplina.
 */
import { SubjectChatPanel } from "../../features/subject-chat/SubjectChatPanel.js";

/**
 * Props da página de chat do aluno.
 */
type StudentSubjectChatPageProps = {
    subjectId: string;
};

/**
 * Página do aluno para conversa em tempo real com o professor da disciplina.
 *
 * @param props Disciplina alvo.
 * @returns Painel de chat autorizado.
 */
export function StudentSubjectChatPage({ subjectId }: StudentSubjectChatPageProps) {
    return <SubjectChatPanel role="STUDENT" subjectId={subjectId} />;
}
