/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    ClassPost,
    createClassPost,
    listTeacherClassPosts,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherClassPostsPageProps = {
    classId: string;
};

/**
 * Página de publicações do professor.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function TeacherClassPostsPage({ classId }: TeacherClassPostsPageProps) {
    const [posts, setPosts] = useState<ClassPost[]>([]);
    const [type, setType] = useState<"NOTICE" | "POST">("NOTICE");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setPosts(await listTeacherClassPosts(classId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar publicações."),
        );
    }, [classId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createClassPost(classId, { type, title, body });
            setTitle("");
            setBody("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao publicar.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Publicações</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <select value={type} onChange={(event) => setType(event.target.value as "NOTICE" | "POST")}>
                    <option value="NOTICE">Aviso</option>
                    <option value="POST">Publicação</option>
                </select>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
                <textarea rows={6} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Mensagem" />
                <button className="sf-button-primary">Publicar</button>
            </form>
            <PostList posts={posts} />
        </section>
    );
}

/**
 * Executa a operação post list no domínio de teacher com contrato explícito.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
function PostList({ posts }: { posts: ClassPost[] }) {
    return (
        <div className="grid gap-3">
            {posts.length === 0 ? <p className="sf-panel text-sm text-studyflow-text">Ainda não há publicações.</p> : null}
            {posts.map((post) => (
                <article className="sf-panel space-y-1" key={post._id}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-studyflow-brand">{post.type === "NOTICE" ? "Aviso" : "Publicação"}</p>
                    <h2 className="font-semibold">{post.title}</h2>
                    <p className="whitespace-pre-wrap text-sm text-studyflow-text">{post.body}</p>
                </article>
            ))}
        </div>
    );
}
