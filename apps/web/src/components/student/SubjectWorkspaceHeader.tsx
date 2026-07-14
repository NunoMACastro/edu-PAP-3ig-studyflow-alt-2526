/** Chrome comum das tabs de disciplina sem pedidos de dados duplicados. */
import { useEffect, useState } from "react";
import { listStudentSubjectChatUnread, rememberStudentContext } from "../../lib/apiClient.js";
import { PageHeader } from "../PageHeader.js";
import { Breadcrumbs, WorkspaceTabs } from "./StudentWorkspace.js";

export type SubjectWorkspaceTab = "overview" | "materials" | "practice" | "chat" | "assistant";

const labels: Record<SubjectWorkspaceTab, { title: string; description: string }> = {
    overview: { title: "Disciplina", description: "Visão geral do contexto oficial." },
    materials: { title: "Materiais", description: "Conteúdo oficial publicado nesta disciplina." },
    practice: { title: "Praticar", description: "Mini-testes e conteúdos aprovados pelo professor." },
    chat: { title: "Conversar", description: "Conversa no contexto autorizado da disciplina." },
    assistant: { title: "Assistente de estudo", description: "Apoio baseado nos materiais oficiais e regras da disciplina." },
};

export function SubjectWorkspaceHeader({ subjectId, active }: { subjectId: string; active: SubjectWorkspaceTab }) {
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => { void rememberStudentContext({ kind: "SUBJECT", contextId: subjectId }).catch(() => undefined); }, [subjectId]);
    useEffect(() => {
        let mounted = true;
        listStudentSubjectChatUnread()
            .then((items) => { if (mounted) setUnreadCount(items.find((item) => item.subjectId === subjectId)?.unreadCount ?? 0); })
            .catch(() => undefined);
        return () => { mounted = false; };
    }, [subjectId]);
    useEffect(() => {
        const handleRead = (event: Event) => {
            const detail = (event as CustomEvent<{ subjectId?: string }>).detail;
            if (detail?.subjectId === subjectId) setUnreadCount(0);
        };
        window.addEventListener("student-subject-chat-read", handleRead);
        return () => window.removeEventListener("student-subject-chat-read", handleRead);
    }, [subjectId]);
    const base = `/app/disciplinas/${subjectId}`;
    return <div className="space-y-5"><Breadcrumbs items={[{ label: "Estudar", href: "/app/estudar" }, { label: "Disciplina" }]} /><PageHeader title={labels[active].title} description={labels[active].description} /><WorkspaceTabs items={[{ label: "Visão geral", href: base, active: active === "overview" }, { label: "Materiais", href: `${base}/materiais`, active: active === "materials" }, { label: "Praticar", href: `${base}/praticar`, active: active === "practice" }, { label: unreadCount > 0 ? `Conversar (${unreadCount})` : "Conversar", href: `${base}/chat`, active: active === "chat" }]} /></div>;
}
