/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    ClassPost,
    createClassPost,
    listTeacherClassPosts,
} from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";
import { PageHeader } from "../../components/PageHeader.js";
import { EmptyState } from "../../components/ui/CalmUi.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import { useHashSidePanel } from "../../hooks/useHashSidePanel.js";

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
    const publishAction = useAsyncAction();
    const [createOpen, setCreateOpen] = useState(false);
    useHashSidePanel("#criar-publicacao", setCreateOpen);

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
        await publishAction.run("publish", async () => {
            await createClassPost(classId, { type, title, body });
            setTitle("");
            setBody("");
            await refresh();
            setCreateOpen(false);
        }, "Erro ao publicar.");
    }

    return (
        <section className="space-y-6">
            <PageHeader action={<button aria-expanded={createOpen} className="sf-button-primary" onClick={() => setCreateOpen(true)} type="button">Nova publicação</button>} description="Avisos e publicações visíveis para os alunos da turma." title="Publicações" />
            {posts.length === 0 ? <EmptyState icon="megaphone" title="Ainda não há publicações" /> : <PostList posts={posts} />}
            <SidePanel closeDisabled={publishAction.isPending} description="Escolhe o tipo e escreve a mensagem para a turma." onClose={() => setCreateOpen(false)} open={createOpen} title="Criar publicação">
            <form className="space-y-4" id="criar-publicacao" onSubmit={(event) => void handleSubmit(event)}>
                {error || publishAction.error ? <p className="sf-error" role="alert">{publishAction.error ?? error}</p> : null}
                <label className="block space-y-2">
                    <span>Tipo de publicação</span>
                    <select value={type} onChange={(event) => setType(event.target.value as "NOTICE" | "POST")}>
                        <option value="NOTICE">Aviso</option>
                        <option value="POST">Publicação</option>
                    </select>
                </label>
                <label className="block space-y-2">
                    <span>Título</span>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="block space-y-2">
                    <span>Mensagem</span>
                    <textarea rows={6} value={body} onChange={(event) => setBody(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={publishAction.isPending}>
                    {publishAction.isPending ? "A publicar..." : "Publicar"}
                </button>
            </form>
            </SidePanel>
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
            {posts.length === 0 ? <p className="sf-notice text-sm text-studyflow-text">Ainda não há publicações.</p> : null}
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
    );
}
