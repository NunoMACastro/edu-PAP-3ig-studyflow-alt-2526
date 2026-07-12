/**
 * Implementa a página do aluno para chat da disciplina.
 */
import { PageHeader } from "../../components/PageHeader.js";
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
    return (
        <section className="space-y-6">
            <PageHeader description="Conversa em tempo real com o professor e os colegas autorizados desta disciplina." title="Chat da disciplina" />
            <SubjectChatPanel role="STUDENT" subjectId={subjectId} />
        </section>
    );
}
