/** Workspace de grupo com tabs por rota e contexto conhecido. */
import { PageHeader } from "../../components/PageHeader.js";
import { useEffect, useState } from "react";
import { Breadcrumbs, WorkspaceTabs } from "../../components/student/StudentWorkspace.js";
import { StudyGroupMessagesPanel } from "../../features/study-group-messages/study-group-messages-panel.js";
import { StudyGroupSessionsPanel } from "../../features/study-group-sessions/study-group-sessions-panel.js";
import { listStudyGroups } from "../../features/study-groups/create-study-group.js";
import { InlineNotice } from "../../components/ui/CalmUi.js";
import { rememberStudentContext } from "../../lib/apiClient.js";

export function StudentGroupWorkspacePage({ groupId, tab = "mensagens" }: { groupId: string; tab?: "mensagens" | "sessoes" }) {
    const base = `/app/grupos/${groupId}`;
    const [title, setTitle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => { let active = true; listStudyGroups().then((groups) => { const group = groups.find((item) => item._id === groupId); if (!group) throw new Error("Grupo não encontrado."); if (active) { setTitle(group.title); void rememberStudentContext({ kind: "STUDY_GROUP", contextId: groupId }).catch(() => undefined); } }).catch((caught) => active && setError(caught instanceof Error ? caught.message : "Não foi possível abrir o grupo.")); return () => { active = false; }; }, [groupId]);
    if (error) return <InlineNotice tone="danger">{error}</InlineNotice>;
    if (!title) return <InlineNotice>A carregar grupo...</InlineNotice>;
    return <section className="space-y-6"><Breadcrumbs items={[{ label: "Em grupo", href: "/app/em-grupo" }, { label: title }]} /><PageHeader title={title} description="Mensagens e sessões partilham este contexto. O Assistente está sempre disponível no canto inferior." /><WorkspaceTabs items={[{ label: "Mensagens e notas", href: `${base}/mensagens`, active: tab === "mensagens" }, { label: "Sessões", href: `${base}/sessoes`, active: tab === "sessoes" }]} />{tab === "mensagens" ? <StudyGroupMessagesPanel contextLocked initialGroupId={groupId} /> : null}{tab === "sessoes" ? <StudyGroupSessionsPanel contextLocked initialGroupId={groupId} /> : null}</section>;
}
