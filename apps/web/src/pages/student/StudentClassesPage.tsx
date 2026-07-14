/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { StatusBadge, Toolbar } from "../../components/ui/CalmUi.js";
import { listStudentClasses, type StudentClassSummary } from "../../lib/apiClient.js";

/**
 * Página de turmas onde o aluno está inscrito.
 *
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudentClassesPage() {
    const [classes, setClasses] = useState<StudentClassSummary[]>([]);
    const [status, setStatus] = useState<StudentClassSummary["status"]>("ACTIVE");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listStudentClasses(status)
            .then((nextClasses) => {
                if (active) setClasses(nextClasses);
            })
            .catch((caught: unknown) => {
                if (active) {
                    setError(caught instanceof Error ? caught.message : "Erro ao carregar turmas.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [reloadToken, status]);

    return (
        <section className="space-y-6">
            <PageHeader
                description="Consulta as turmas onde estás inscrito e acede às respetivas disciplinas e atividades."
                title="As minhas turmas"
            />
            <Toolbar ariaLabel="Filtrar turmas por estado">
                <button className={status === "ACTIVE" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setStatus("ACTIVE")} type="button">Ativas</button>
                <button className={status === "ARCHIVED" ? "sf-button-primary" : "sf-button-secondary"} onClick={() => setStatus("ARCHIVED")} type="button">Arquivo</button>
            </Toolbar>
            <AsyncStateBlock
                error={error ?? undefined}
                isEmpty={classes.length === 0}
                isLoading={loading}
                emptyMessage={status === "ACTIVE" ? "Ainda não estás inscrito em turmas ativas" : "Não tens turmas no arquivo"}
                onRetry={() => setReloadToken((value) => value + 1)}
            >
                <div aria-label="Turmas do aluno" className="grid gap-3">
                {classes.map((schoolClass) => (
                    <article className="sf-list-card space-y-2" key={schoolClass._id}>
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="font-semibold">{schoolClass.name}</h2>
                            <StatusBadge tone={schoolClass.status === "ACTIVE" ? "brand" : "neutral"}>{schoolClass.status === "ACTIVE" ? "Ativa" : "Arquivo · consulta"}</StatusBadge>
                        </div>
                        <p className="text-sm text-studyflow-text">{schoolClass.code} · {schoolClass.schoolYear}</p>
                        <div className="flex flex-wrap gap-2">
                            <a className="sf-button-primary" href={`/app/turmas/${schoolClass._id}/disciplinas`}>Ver disciplinas</a>
                            <a className="sf-button-secondary" href={`/app/turmas/${schoolClass._id}/publicacoes`}>Ver publicações</a>
                            <a className="sf-button-secondary" href={`/app/turmas/${schoolClass._id}/salas-guiadas${schoolClass.status === "ARCHIVED" ? "?status=CLOSED" : ""}`}>Salas guiadas</a>
                            <a className="sf-button-secondary" href={`/app/turmas/${schoolClass._id}/projectos`}>Projectos</a>
                        </div>
                    </article>
                ))}
                </div>
            </AsyncStateBlock>
        </section>
    );
}
