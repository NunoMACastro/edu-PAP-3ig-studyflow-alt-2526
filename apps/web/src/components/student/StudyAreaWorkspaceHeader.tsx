/** Chrome comum das tabs de uma área privada sem duplicar a carga da página. */
import { useEffect } from "react";
import { rememberStudentContext } from "../../lib/apiClient.js";
import { PageHeader } from "../PageHeader.js";
import { Breadcrumbs, WorkspaceTabs } from "./StudentWorkspace.js";

export type StudyAreaWorkspaceTab = "overview" | "materials" | "practice" | "assistant" | "settings";

const labels: Record<StudyAreaWorkspaceTab, { title: string; description: string }> = {
    overview: { title: "Área de estudo", description: "Visão geral do teu contexto privado." },
    materials: { title: "Materiais", description: "Consulta e adiciona materiais desta área privada." },
    practice: { title: "Praticar", description: "Resumos, explicações, flashcards e quizzes." },
    assistant: { title: "Assistente de estudo", description: "Perguntas baseadas nas fontes autorizadas desta área." },
    settings: { title: "Definições", description: "Perfil pedagógico, voz, fontes e arquivo." },
};

export function StudyAreaWorkspaceHeader({ studyAreaId, active }: { studyAreaId: string; active: StudyAreaWorkspaceTab }) {
    useEffect(() => { void rememberStudentContext({ kind: "STUDY_AREA", contextId: studyAreaId }).catch(() => undefined); }, [studyAreaId]);
    const base = `/app/areas/${studyAreaId}`;
    return <div className="space-y-5"><Breadcrumbs items={[{ label: "Estudar", href: "/app/estudar" }, { label: "Estudo pessoal" }]} /><PageHeader title={labels[active].title} description={labels[active].description} /><WorkspaceTabs items={[{ label: "Visão geral", href: base, active: active === "overview" }, { label: "Materiais", href: `${base}/materiais`, active: active === "materials" }, { label: "Praticar", href: `${base}/ferramentas`, active: active === "practice" }, { label: "Definições", href: `${base}/definicoes`, active: active === "settings" }]} /></div>;
}
