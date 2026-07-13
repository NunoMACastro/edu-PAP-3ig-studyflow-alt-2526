/**
 * Implementa a página do aluno para chat da disciplina.
 */
import { useEffect, useState } from "react";
import { SubjectWorkspaceHeader } from "../../components/student/SubjectWorkspaceHeader.js";
import { SubjectChatPanel } from "../../features/subject-chat/SubjectChatPanel.js";
import { getStudentSubjectOverview } from "../../lib/apiClient.js";
import { InlineNotice } from "../../components/ui/CalmUi.js";

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
    const [readOnly, setReadOnly] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let active = true;
        getStudentSubjectOverview(subjectId)
            .then((overview) => { if (active) setReadOnly(overview.readOnly); })
            .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : "Não foi possível abrir o chat."); });
        return () => { active = false; };
    }, [subjectId]);
    return (
        <section className="space-y-6">
            <SubjectWorkspaceHeader active="chat" subjectId={subjectId} />
            {error ? <InlineNotice tone="danger">{error}</InlineNotice> : readOnly === null ? <InlineNotice>A preparar conversa...</InlineNotice> : <SubjectChatPanel readOnly={readOnly} role="STUDENT" subjectId={subjectId} />}
        </section>
    );
}
