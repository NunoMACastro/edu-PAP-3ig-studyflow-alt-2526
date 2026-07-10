/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { getProfile, StudentProfile, updateProfile } from "../../lib/apiClient.js";
import { useAsyncAction } from "../../hooks/useAsyncAction.js";

/**
 * Página de edição do perfil do aluno.
 *
 * @returns Formulário protegido de perfil.
 */
export function ProfilePage() {
    const [profile, setProfile] = useState<StudentProfile>({
        name: "",
        year: "",
        course: "",
        className: "",
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const saveAction = useAsyncAction();

    useEffect(() => {
        let active = true;
        setLoading(true);
        getProfile()
            .then((loadedProfile) => {
                if (active && loadedProfile) setProfile(loadedProfile);
            })
            .catch((caught) => {
                if (active) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : "Não foi possível carregar o perfil.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    /**
     * Atualiza um campo simples do formulário.
     *
     * @param field Valor de field usado pela função para executar update field com dados explícitos.
     * @param value Valor textual recebido do exterior ou de ficheiro antes de ser normalizado, dividido ou sanitizado.
     * @returns Não devolve payload; termina quando os efeitos locais ou remotos ficam concluídos.
     */
    function updateField(field: keyof StudentProfile, value: string): void {
        setProfile((current) => ({ ...current, [field]: value }));
    }

    /**
     * Guarda o perfil no backend.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois da resposta da API.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setMessage(null);
        const updated = await saveAction.run(
            "save-profile",
            () => updateProfile(profile),
            "Não foi possível guardar.",
        );
        if (updated) {
            setProfile(updated);
            setMessage("Perfil guardado.");
        }
    }

    return (
        <section className="sf-panel max-w-2xl space-y-4">
            <h1 className="text-xl font-bold">Perfil</h1>
            {message ? <p className="sf-success">{message}</p> : null}
            {error || saveAction.error ? (
                <p className="sf-error" role="alert">
                    {saveAction.error ?? error}
                </p>
            ) : null}
            {loading ? <p className="text-sm" aria-live="polite">A carregar perfil...</p> : null}
            <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
                <div className="space-y-2">
                    <label htmlFor="name">Nome</label>
                    <input id="name" value={profile.name ?? ""} onChange={(event) => updateField("name", event.target.value)} required />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label htmlFor="year">Ano</label>
                        <input
                            aria-describedby="year-help"
                            id="year"
                            value={profile.year ?? ""}
                            onChange={(event) => updateField("year", event.target.value)}
                        />
                        <p id="year-help" className="text-xs text-studyflow-text">
                            Ajuda a IA da sala a adaptar a linguagem e o detalhe das explicações.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="course">Curso</label>
                        <input id="course" value={profile.course ?? ""} onChange={(event) => updateField("course", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="className">Turma</label>
                        <input id="className" value={profile.className ?? ""} onChange={(event) => updateField("className", event.target.value)} />
                    </div>
                </div>
                <button className="sf-button-primary w-fit" disabled={loading || saveAction.isPending} type="submit">
                    {saveAction.isPending ? "A guardar..." : "Guardar"}
                </button>
            </form>
        </section>
    );
}
