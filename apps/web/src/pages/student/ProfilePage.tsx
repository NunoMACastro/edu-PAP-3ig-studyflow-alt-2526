/**
 * Implementa uma pagina React de student com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import { FormField } from "../../components/forms/FormField.js";
import { PageHeader } from "../../components/PageHeader.js";
import { InlineNotice } from "../../components/ui/CalmUi.js";
import { Surface } from "../../components/ui/Surface.js";
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
    });
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [reloadToken, setReloadToken] = useState(0);
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
    }, [reloadToken]);

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
        <section className="max-w-4xl space-y-6">
            <PageHeader description="Mantém os teus dados de aprendizagem atualizados para personalizar a experiência de estudo." title="Perfil" />
            {message ? <InlineNotice tone="brand">{message}</InlineNotice> : null}
            {error || saveAction.error ? <div className="space-y-3"><InlineNotice tone="danger">{saveAction.error ?? error}</InlineNotice>{error ? <button className="sf-button-secondary" onClick={() => setReloadToken((value) => value + 1)} type="button">Tentar novamente</button> : null}</div> : null}
            {loading ? <InlineNotice>A carregar perfil...</InlineNotice> : null}
            {!loading && !error ? <Surface as="section" className="max-w-3xl">
            <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
                <FormField id="student-profile-name" label="Nome">
                    <input value={profile.name ?? ""} onChange={(event) => updateField("name", event.target.value)} required />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormField id="student-profile-year" label="Ano" helpText="Ajuda a IA da sala a adaptar a linguagem e o detalhe das explicações.">
                        <input
                            value={profile.year ?? ""}
                            onChange={(event) => updateField("year", event.target.value)}
                        />
                    </FormField>
                    <FormField id="student-profile-course" label="Curso">
                        <input value={profile.course ?? ""} onChange={(event) => updateField("course", event.target.value)} />
                    </FormField>
                </div>
                <button className="sf-button-primary w-fit" disabled={loading || saveAction.isPending} type="submit">
                    {saveAction.isPending ? "A guardar..." : "Guardar"}
                </button>
            </form>
            </Surface> : null}
        </section>
    );
}
