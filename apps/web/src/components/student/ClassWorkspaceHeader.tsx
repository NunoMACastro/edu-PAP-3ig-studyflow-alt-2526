/** Chrome comum das três tabs de turma. */
import { PageHeader } from "../PageHeader.js";
import { Breadcrumbs, WorkspaceTabs } from "./StudentWorkspace.js";

const labels = {
    subjects: { title: "Disciplinas", description: "Escolhe uma disciplina para continuar." },
    posts: { title: "Publicações", description: "Avisos e publicações partilhados pelo professor." },
    projects: { title: "Projetos", description: "Projetos publicados e respetivas datas." },
} as const;

export function ClassWorkspaceHeader({ classId, active }: { classId: string; active: keyof typeof labels }) {
    const base = `/app/turmas/${classId}`;
    return <div className="space-y-5"><Breadcrumbs items={[{ label: "Estudar", href: "/app/estudar" }, { label: "Turma" }]} /><PageHeader title={labels[active].title} description={labels[active].description} /><WorkspaceTabs items={[{ label: "Disciplinas", href: `${base}/disciplinas`, active: active === "subjects" }, { label: "Publicações", href: `${base}/publicacoes`, active: active === "posts" }, { label: "Projetos", href: `${base}/projectos`, active: active === "projects" }]} /></div>;
}
