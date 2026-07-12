/**
 * Implementa a página do professor para chat da disciplina.
 */
import { PageHeader } from "../../components/PageHeader.js";
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
    return (
        <section className="space-y-6">
            <PageHeader description="Conversa em tempo real com os alunos inscritos nesta disciplina." title="Chat da disciplina" />
            <SubjectChatPanel role="TEACHER" subjectId={subjectId} />
        </section>
    );
}
