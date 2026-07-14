/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { AsyncStateBlock } from "../../components/ui/AsyncStateBlock.js";
import { SidePanel } from "../../components/ui/SidePanel.js";
import {
    addStudyRoomMember,
    createRoomShare,
    listRoomShares,
    listStudyAreas,
    listMaterials,
    rememberStudentContext,
    RoomShare,
} from "../../lib/apiClient.js";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer.js";

/**
 * Props do componente React de student; mantêm explícitas as dependências vindas da página.
 */
type RoomSharesPageProps = {
    roomId: string;
};

/**
 * Página de partilhas de uma sala.
 *
 * @param props Propriedades recebidas pelo componente React; concentram os dados e callbacks necessários para renderizar a UI.
 * @returns Elemento React pronto a ser renderizado pela página ou rota atual.
 */
export function RoomSharesPage({ roomId }: RoomSharesPageProps) {
    const [shares, setShares] = useState<RoomShare[]>([]);
    const [type, setType] = useState<"NOTE" | "URL" | "MATERIAL_REF">("NOTE");
    const [title, setTitle] = useState("");
    const [textContent, setTextContent] = useState("");
    const [url, setUrl] = useState("");
    const [materialId, setMaterialId] = useState("");
    const [materialOptions, setMaterialOptions] = useState<{ id: string; label: string }[]>([]);
    const [memberEmail, setMemberEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [shareOpen, setShareOpen] = useState(false);
    const [memberOpen, setMemberOpen] = useState(false);
    const [savingShare, setSavingShare] = useState(false);
    const [savingMember, setSavingMember] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Recarrega dados remotos para manter a interface atualizada.
     *
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function refresh(): Promise<void> {
        setShares(await listRoomShares(roomId));
        void rememberStudentContext({ kind: "STUDY_ROOM", contextId: roomId }).catch(() => undefined);
    }

    async function loadMaterialOptions(): Promise<void> {
        const areas = await listStudyAreas();
        const collections = await Promise.all(
            areas.map(async (area) => ({ area, materials: await listMaterials(area._id) })),
        );
        setMaterialOptions(collections.flatMap(({ area, materials }) =>
            materials.map((material) => ({ id: material._id, label: `${area.name} · ${material.title}` })),
        ));
    }

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);
        Promise.all([refresh(), loadMaterialOptions()])
            .catch((caught: unknown) => {
                if (active) setError(caught instanceof Error ? caught.message : "Erro ao carregar partilhas.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [roomId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleShareSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSavingShare(true);
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
            setShareOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao partilhar.");
        } finally {
            setSavingShare(false);
        }
    }

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface usado para impedir o comportamento padrão e recolher dados do formulário.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    async function handleMemberSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSavingMember(true);
        try {
            await addStudyRoomMember(roomId, memberEmail);
            setMemberEmail("");
            setMemberOpen(false);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao adicionar membro.");
        } finally {
            setSavingMember(false);
        }
    }

    return (
        <section className="space-y-6">
            <PageHeader
                action={<><button aria-expanded={shareOpen} className="sf-button-primary" onClick={() => { setError(null); setMemberOpen(false); setShareOpen(true); }} type="button">Nova partilha</button><button aria-expanded={memberOpen} className="sf-button-secondary" onClick={() => { setError(null); setShareOpen(false); setMemberOpen(true); }} type="button">Adicionar membro</button></>}
                description="Consulta e adiciona fontes partilhadas com os membros desta sala de estudo."
                title="Partilhas da sala"
            />
            <AsyncStateBlock error={error && !shareOpen && !memberOpen ? error : undefined} isEmpty={shares.length === 0} isLoading={loading} emptyMessage="Ainda não há partilhas nesta sala">
                <div aria-label="Partilhas da sala" className="grid gap-3 md:grid-cols-2">
                    {shares.map((share) => (
                        <article className="sf-list-card min-w-0 space-y-1" key={share._id}>
                            <h2 className="break-words font-semibold">{share.tombstoned ? "Partilha removida" : share.title}</h2>
                            <p className="text-sm text-studyflow-text/70">{shareTypeLabel(share.type)} · {share.usableByAi ? "pode alimentar IA" : "referência"}</p>
                            {share.textContent && share.contentFormat === "MARKDOWN" ? <MarkdownViewer className="text-sm" source={share.textContent} /> : share.textContent ? <p className="whitespace-pre-wrap break-words text-sm leading-6 text-studyflow-text">{share.textContent}</p> : null}
                            {share.contentFormat === "MARKDOWN" && !share.tombstoned ? <a className="sf-button-secondary mt-3 inline-flex" href={`/api/study-rooms/${roomId}/shares/${share._id}/download`}>Descarregar .md</a> : null}
                            {share.url ? <a className="block break-all text-sm text-studyflow-brandText underline" href={share.url}>{share.url}</a> : null}
                        </article>
                    ))}
                </div>
            </AsyncStateBlock>
            <SidePanel closeDisabled={savingShare} description="Adiciona uma nota, ligação ou referência a material próprio." onClose={() => setShareOpen(false)} open={shareOpen} title="Nova partilha">
                <form className="space-y-4" onSubmit={(event) => void handleShareSubmit(event)}>
                    {error ? <p className="sf-error" role="alert">{error}</p> : null}
                    <FormField id="room-share-type" label="Tipo">
                        <select value={type} onChange={(event) => setType(event.target.value as "NOTE" | "URL" | "MATERIAL_REF")}>
                            <option value="NOTE">Apontamento</option>
                            <option value="URL">URL</option>
                            <option value="MATERIAL_REF">Material próprio</option>
                        </select>
                    </FormField>
                    <FormField id="room-share-title" label="Título">
                        <input value={title} onChange={(event) => setTitle(event.target.value)} />
                    </FormField>
                    {type === "URL" ? (
                        <FormField id="room-share-url" label="URL">
                            <input value={url} onChange={(event) => setUrl(event.target.value)} />
                        </FormField>
                    ) : null}
                    {type === "MATERIAL_REF" ? (
                        <><FormField id="room-share-material" label="Material próprio">
                            <select value={materialId} onChange={(event) => setMaterialId(event.target.value)}>
                                <option value="">Selecionar material</option>
                                {materialOptions.map((material) => <option key={material.id} value={material.id}>{material.label}</option>)}
                            </select>
                        </FormField>{materialOptions.length === 0 ? <a className="block text-sm text-studyflow-brandText underline" href="/app/estudar?vista=pessoal">Criar um material Markdown numa área</a> : null}</>
                    ) : (
                        <FormField id="room-share-text" label="Texto">
                            <textarea rows={5} value={textContent} onChange={(event) => setTextContent(event.target.value)} />
                        </FormField>
                    )}
                    <button className="sf-button-primary" disabled={savingShare || title.trim().length === 0 || (type === "MATERIAL_REF" && !materialId) || (type === "URL" && !url.trim())}>{savingShare ? "A partilhar..." : "Partilhar"}</button>
                </form>
            </SidePanel>
            <SidePanel closeDisabled={savingMember} description="Convida outro aluno através do email da respetiva conta." onClose={() => setMemberOpen(false)} open={memberOpen} title="Adicionar membro">
                <form className="space-y-4" onSubmit={(event) => void handleMemberSubmit(event)}>
                    {error ? <p className="sf-error" role="alert">{error}</p> : null}
                    <FormField id="room-member-email" label="Email do novo membro">
                        <input type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="email@exemplo.pt" />
                    </FormField>
                    <button className="sf-button-primary" disabled={!memberEmail || savingMember}>
                        {savingMember ? "A adicionar..." : "Adicionar"}
                    </button>
                </form>
            </SidePanel>
        </section>
    );
}

/** Traduz o tipo persistido de uma partilha de sala. */
function shareTypeLabel(type: RoomShare["type"]): string {
    if (type === "NOTE") return "Nota";
    if (type === "MATERIAL_REF") return "Material próprio";
    return "Ligação web";
}
