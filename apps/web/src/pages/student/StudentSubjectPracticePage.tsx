/** Landing canónica que separa avaliação oficial de conteúdos docentes. */
import { SubjectWorkspaceHeader } from "../../components/student/SubjectWorkspaceHeader.js";
import { PrimaryActionCard } from "../../components/student/StudentWorkspace.js";

export function StudentSubjectPracticePage({ subjectId }: { subjectId: string }) {
    const base = `/app/disciplinas/${subjectId}`;
    return (
        <section className="space-y-6">
            <SubjectWorkspaceHeader active="practice" subjectId={subjectId} />
            <div className="grid gap-4 md:grid-cols-2">
                <PrimaryActionCard actionLabel="Ver mini-testes" description="Realiza os mini-testes publicados pelo professor e consulta as tuas tentativas." href={`${base}/testes`} icon="clipboard" title="Mini-testes oficiais" />
                <PrimaryActionCard actionLabel="Ver conteúdos" description="Consulta resumos e quizzes escritos e aprovados pelo professor." href={`${base}/conteudos-aprovados`} icon="spark" title="Conteúdos aprovados" />
            </div>
        </section>
    );
}
