/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { ClassWorkspaceHeader } from "../../components/student/ClassWorkspaceHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { listStudentClassPosts, StudentClassPost } from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudentClassPostsPageProps = {
    classId: string;
};

/**
 * Página de publicações oficiais visíveis ao aluno inscrito.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudentClassPostsPage({ classId }: StudentClassPostsPageProps) {
    const [posts, setPosts] = useState<StudentClassPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        listStudentClassPosts(classId)
            .then((nextPosts) => {
                if (active) setPosts(nextPosts);
            })
            .catch((caught: unknown) => {
                if (active) setError(caught instanceof Error ? caught.message : "Erro ao carregar publicações.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [classId, reloadToken]);

    return (
        <section className="space-y-6">
            <ClassWorkspaceHeader active="posts" classId={classId} />
            <AsyncStateBlock error={error ?? undefined} isEmpty={posts.length === 0} isLoading={loading} emptyMessage="Ainda não há publicações" onRetry={() => setReloadToken((value) => value + 1)}>
                <div aria-label="Publicações da turma" className="grid gap-3">
                {posts.map((post) => (
                    <article className="sf-list-card space-y-1" key={post._id}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-studyflow-brandText">{post.type === "NOTICE" ? "Aviso" : "Publicação"}</p>
                        <h2 className="font-semibold">
                            {post.tombstoned ? "Publicação removida" : post.title}
                        </h2>
                        {!post.tombstoned ? (
                            <p className="whitespace-pre-wrap text-sm text-studyflow-text">{post.body}</p>
                        ) : null}
                    </article>
                ))}
                </div>
            </AsyncStateBlock>
        </section>
    );
}
