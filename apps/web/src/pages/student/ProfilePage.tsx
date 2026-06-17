/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { getProfile, StudentProfile, updateProfile } from "../../lib/apiClient.js";

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

    useEffect(() => {
        void getProfile().then((loadedProfile) => {
            if (loadedProfile) setProfile(loadedProfile);
        });
    }, []);

    /**
     * Atualiza um campo simples do formulário.
     *
     * @param field Campo editável do perfil.
     * @param value Valor vindo do input.
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
        setError(null);
        setMessage(null);
        try {
            setProfile(await updateProfile(profile));
            setMessage("Perfil guardado.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
        }
    }

    return (
        <section className="sf-panel max-w-2xl space-y-4">
            <h1 className="text-xl font-bold">Perfil</h1>
            {message ? <p className="sf-success">{message}</p> : null}
            {error ? <p className="sf-error">{error}</p> : null}
            <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
                <div className="space-y-2">
                    <label htmlFor="name">Nome</label>
                    <input id="name" value={profile.name ?? ""} onChange={(event) => updateField("name", event.target.value)} required />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label htmlFor="year">Ano</label>
                        <input id="year" value={profile.year ?? ""} onChange={(event) => updateField("year", event.target.value)} />
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
                <button className="sf-button-primary w-fit" type="submit">
                    Guardar
                </button>
            </form>
        </section>
    );
}
