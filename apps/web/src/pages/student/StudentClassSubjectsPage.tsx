/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { ClassWorkspaceHeader } from "../../components/student/ClassWorkspaceHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { StatusBadge, Toolbar } from "../../components/ui/CalmUi.js";
import { listStudentSubjects, type StudentSubjectSummary } from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudentClassSubjectsPageProps = {
    classId: string;
};

/**
 * Página de disciplinas disponíveis para o aluno numa turma onde está inscrito.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudentClassSubjectsPage({ classId }: StudentClassSubjectsPageProps) {
    const [subjects, setSubjects] = useState<StudentSubjectSummary[]>([]);
    const [status, setStatus] = useState<StudentSubjectSummary["status"]>("ACTIVE");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listStudentSubjects(classId, status)
            .then((nextSubjects) => {
                if (active) setSubjects(nextSubjects);
            })
            .catch((caught: unknown) => {
                if (active) {
                    setError(caught instanceof Error ? caught.message : "Erro ao carregar disciplinas.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [classId, reloadToken, status]);

    return (
        <section className="space-y-6">
            <ClassWorkspaceHeader active="subjects" classId={classId} />
            <Toolbar ariaLabel="Filtrar disciplinas por estado" className="!inline-flex !w-auto !grid-cols-none !gap-1 !rounded-xl !p-1">
                <button aria-pressed={status === "ACTIVE"} className={status === "ACTIVE" ? "min-h-11 rounded-lg bg-studyflow-brand px-4 text-sm font-semibold text-white" : "min-h-11 rounded-lg px-4 text-sm font-semibold text-studyflow-text/70 hover:bg-studyflow-card/70 hover:text-studyflow-text"} onClick={() => setStatus("ACTIVE")} type="button">Ativas</button>
                <button aria-pressed={status === "ARCHIVED"} className={status === "ARCHIVED" ? "min-h-11 rounded-lg bg-studyflow-brand px-4 text-sm font-semibold text-white" : "min-h-11 rounded-lg px-4 text-sm font-semibold text-studyflow-text/70 hover:bg-studyflow-card/70 hover:text-studyflow-text"} onClick={() => setStatus("ARCHIVED")} type="button">Arquivo</button>
            </Toolbar>
            <AsyncStateBlock error={error ?? undefined} isEmpty={subjects.length === 0} isLoading={loading} emptyMessage={status === "ACTIVE" ? "Esta turma ainda não tem disciplinas ativas" : "Não há disciplinas no arquivo"} onRetry={() => setReloadToken((value) => value + 1)}>
                <div aria-label="Disciplinas da turma" className="grid gap-3">
                {subjects.map((subject) => (
                    <article className="sf-list-card space-y-2" key={subject._id}>
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-semibold">{subject.name}</h2>
                            <StatusBadge tone={!subject.readOnly ? "brand" : "neutral"}>{subject.readOnly ? "Arquivo · consulta" : "Ativa"}</StatusBadge>
                        </div>
                        <p className="text-sm text-studyflow-text/70">{subject.code}</p>
                        {subject.description ? <p className="text-sm leading-6 text-studyflow-text/80">{subject.description}</p> : null}
                        <a className="sf-button-primary mt-2 inline-flex" href={`/app/disciplinas/${subject._id}`}>{subject.readOnly ? "Consultar disciplina" : "Abrir disciplina"}</a>
                    </article>
                ))}
                </div>
            </AsyncStateBlock>
        </section>
    );
}
