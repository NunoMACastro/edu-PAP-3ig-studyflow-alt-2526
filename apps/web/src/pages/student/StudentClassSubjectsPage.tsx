/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { ShellIcon } from "../../components/layout/shell-icons.js";
import { PageHeader } from "../../components/PageHeader.js";
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
            <PageHeader
                description="Escolhe uma disciplina para estudar com materiais, IA, chat e mini-testes oficiais."
                title="Disciplinas da turma"
            />
            <Toolbar ariaLabel="Filtrar disciplinas por estado">
                <button className={status === "ACTIVE" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setStatus("ACTIVE")} type="button">Ativas</button>
                <button className={status === "ARCHIVED" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setStatus("ARCHIVED")} type="button">Arquivo</button>
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
                        <div className="flex flex-wrap gap-2">
                            {!subject.readOnly ? <a className="sf-button-primary" href={`/app/disciplinas/${subject._id}/ia`}>Abrir IA da disciplina</a> : null}
                            <a className="sf-button-secondary" href={`/app/disciplinas/${subject._id}/materiais`}>Materiais oficiais</a>
                            {!subject.readOnly ? <a className="sf-button-secondary gap-2" href={`/app/disciplinas/${subject._id}/chat`}>
                                <ShellIcon className="h-4 w-4" name="message" />
                                Chat
                            </a> : null}
                            <a className="sf-button-secondary" href={`/app/disciplinas/${subject._id}/testes`}>Mini-testes</a>
                            {!subject.readOnly ? <a className="sf-button-secondary" href={`/app/disciplinas/${subject._id}/conteudos-ia`}>Conteúdos aprovados</a> : null}
                            {!subject.readOnly ? <a className="sf-button-secondary" href={`/app/disciplinas/${subject._id}/contextos-materiais`}>Fontes da IA</a> : null}
                        </div>
                    </article>
                ))}
                </div>
            </AsyncStateBlock>
        </section>
    );
}
