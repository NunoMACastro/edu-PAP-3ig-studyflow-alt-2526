/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    addStudyRoomMember,
    createRoomShare,
    listRoomShares,
    RoomShare,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type RoomSharesPageProps = {
    roomId: string;
};

/**
 * Página de partilhas de uma sala.
 */
export function RoomSharesPage({ roomId }: RoomSharesPageProps) {
    const [shares, setShares] = useState<RoomShare[]>([]);
    const [type, setType] = useState<"NOTE" | "URL" | "MATERIAL_REF">("NOTE");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [url, setUrl] = useState("");
    const [materialId, setMaterialId] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     */
    async function refresh(): Promise<void> {
        setShares(await listRoomShares(roomId));
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar partilhas."),
        );
    }, [roomId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleShareSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await createRoomShare(roomId, {
                type,
                title,
                textContent: type === "NOTE" ? textContent : undefined,
                url: type === "URL" ? url : undefined,
                copiedText: type === "URL" ? textContent : undefined,
                materialId: type === "MATERIAL_REF" ? materialId : undefined,
            });
            setTitle("");
            setTextContent("");
            setUrl("");
            setMaterialId("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao partilhar.");
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleMemberSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            await addStudyRoomMember(roomId, memberEmail);
            setMemberEmail("");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar membro.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-4">
                <form className="sf-panel space-y-4" onSubmit={(event) => void handleShareSubmit(event)}>
                    <h1 className="text-xl font-bold">Partilhas da sala</h1>
                    {error ? <p className="sf-error">{error}</p> : null}
                    <label className="block">
                        Tipo
                        <select value={type} onChange={(event) => setType(event.target.value as "NOTE" | "URL" | "MATERIAL_REF")}>
                            <option value="NOTE">Apontamento</option>
                            <option value="URL">URL</option>
                            <option value="MATERIAL_REF">Material próprio</option>
                        </select>
                    </label>
                    <label className="block">
                        Título
                        <input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </label>
                    {type === "URL" ? (
                        <label className="block">
                            URL
                            <input value={url} onChange={(event) => setUrl(event.target.value)} />
                        </label>
                    ) : null}
                    {type === "MATERIAL_REF" ? (
                        <label className="block">
                            ID do material
                            <input value={materialId} onChange={(event) => setMaterialId(event.target.value)} />
                        </label>
                    ) : (
                        <label className="block">
                            Texto
                            <textarea rows={5} value={textContent} onChange={(event) => setTextContent(event.target.value)} />
                        </label>
                    )}
                    <button className="sf-button-primary">Partilhar</button>
                </form>
                <form className="sf-panel space-y-3" onSubmit={(event) => void handleMemberSubmit(event)}>
                    <h2 className="font-semibold">Adicionar membro</h2>
                    <input value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="email@exemplo.pt" />
                    <button className="sf-button-secondary" disabled={!memberEmail}>
                        Adicionar
                    </button>
                </form>
            </div>
            <div className="grid gap-3">
                {shares.length === 0 ? <p className="sf-panel text-sm text-slate-600">Ainda não há partilhas.</p> : null}
                {shares.map((share) => (
                    <article className="sf-panel space-y-1" key={share._id}>
                        <h2 className="font-semibold">{share.title}</h2>
                        <p className="text-sm text-slate-600">{share.type} · {share.usableByAi ? "pode alimentar IA" : "referência"}</p>
                        {share.textContent ? <p className="whitespace-pre-wrap text-sm text-slate-700">{share.textContent}</p> : null}
                        {share.url ? <a className="text-sm text-teal-700" href={share.url}>{share.url}</a> : null}
                    </article>
                ))}
            </div>
        </section>
    );
}
