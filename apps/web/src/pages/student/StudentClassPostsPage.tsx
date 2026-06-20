/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { useEffect, useState } from "react";
import { ClassPost, listStudentClassPosts } from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type StudentClassPostsPageProps = {
    classId: string;
};

/**
 * Página de publicações oficiais visíveis ao aluno inscrito.
 */
export function StudentClassPostsPage({ classId }: StudentClassPostsPageProps) {
    const [posts, setPosts] = useState<ClassPost[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        listStudentClassPosts(classId)
            .then(setPosts)
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar publicações."),
            );
    }, [classId]);

    return (
        <section className="space-y-4">
            <h1 className="text-xl font-bold">Publicações da turma</h1>
            {error ? <p className="sf-error">{error}</p> : null}
            <div className="grid gap-3">
                {posts.length === 0 ? <p className="sf-panel text-sm text-slate-600">Ainda não há publicações.</p> : null}
                {posts.map((post) => (
                    <article className="sf-panel space-y-1" key={post._id}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{post.type === "NOTICE" ? "Aviso" : "Publicação"}</p>
                        <h2 className="font-semibold">{post.title}</h2>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">{post.body}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
