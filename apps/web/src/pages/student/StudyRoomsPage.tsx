/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { createStudyRoom, listStudyRooms, StudyRoom } from "../../lib/apiClient.js";

/**
 * Página de salas de estudo do aluno.
 *
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function StudyRoomsPage() {
    const [rooms, setRooms] = useState<StudyRoom[]>([]);
    const [type, setType] = useState<"FREE" | "SUBJECT">("FREE");
    const [name, setName] = useState("");
    const [disciplineName, setDisciplineName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setRooms(await listStudyRooms());
    }

    useEffect(() => {
        refresh().catch((caught: unknown) =>
            setError(caught instanceof Error ? caught.message : "Erro ao carregar salas."),
        ).finally(() => setLoading(false));
    }, []);

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
            await createStudyRoom({
                name,
                type,
                disciplineName: type === "SUBJECT" ? disciplineName : undefined,
                description,
            });
            setName("");
            setDisciplineName("");
            setDescription("");
            await refresh();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível criar.");
        }
    }

    return (
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <h1 className="text-xl font-bold">Salas de estudo</h1>
                {error ? <p className="sf-error">{error}</p> : null}
                <label className="block">
                    Nome
                    <input value={name} onChange={(event) => setName(event.target.value)} />
                </label>
                <label className="block">
                    Tipo
                    <select value={type} onChange={(event) => setType(event.target.value as "FREE" | "SUBJECT")}>
                        <option value="FREE">Livre</option>
                        <option value="SUBJECT">Por disciplina</option>
                    </select>
                </label>
                {type === "SUBJECT" ? (
                    <label className="block">
                        Disciplina
                        <input value={disciplineName} onChange={(event) => setDisciplineName(event.target.value)} />
                    </label>
                ) : null}
                <label className="block">
                    Descrição
                    <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
                </label>
                <button className="sf-button-primary" disabled={name.trim().length < 2}>
                    Criar sala
                </button>
            </form>
            <div className="grid gap-3">
                {loading ? <p className="text-sm text-studyflow-text">A carregar salas...</p> : null}
                {!loading && rooms.length === 0 ? <p className="sf-panel text-sm text-studyflow-text">Ainda não tens salas.</p> : null}
                {rooms.map((room) => (
                    <article className="sf-panel space-y-2" key={room._id}>
                        <div>
                            <h2 className="font-semibold">{room.name}</h2>
                            <p className="text-sm text-studyflow-text">
                                {room.type === "SUBJECT" ? room.disciplineName : "Sala livre"} · {room.memberIds.length} membros
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a className="sf-button-secondary" href={`/app/salas/${room._id}`}>Partilhas</a>
                            <a className="sf-button-secondary" href={`/app/salas/${room._id}/ia`}>IA da sala</a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
