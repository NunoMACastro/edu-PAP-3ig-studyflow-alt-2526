/** Onboarding não bloqueante baseado na existência do perfil. */
import { FormEvent, useState } from "react";
import { updateProfile, type StudentProfile } from "../../lib/apiClient.js";
import { FormField } from "../forms/FormField.js";
import { InlineNotice } from "../ui/CalmUi.js";

const years = [...Array.from({ length: 12 }, (_, index) => `${index + 1}.º ano`), "Ensino superior", "Prefiro não indicar"];

export function StudentOnboardingCard({ onSaved, onDeferred }: { onSaved: (profile: StudentProfile) => void; onDeferred: () => void }) {
    const [profile, setProfile] = useState<StudentProfile>({ name: "", year: "", course: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setError(null);
        try {
            onSaved(await updateProfile(profile));
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível guardar o perfil.");
        } finally {
            setSaving(false);
        }
    }
    return <section className="rounded-2xl border border-studyflow-brand/30 bg-studyflow-brand/10 p-5 sm:p-6"><h2 className="text-xl font-bold">Vamos adaptar o teu estudo</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-studyflow-text/70">O ano de ensino ajuda o Assistente de estudo a escolher linguagem, detalhe e exemplos. Não altera os conteúdos nem as tuas permissões.</p>{error ? <div className="mt-4"><InlineNotice tone="danger">{error}</InlineNotice></div> : null}<form className="mt-5 grid gap-4" onSubmit={(event) => void submit(event)}><FormField id="onboarding-name" label="Nome"><input required value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} /></FormField><div className="grid gap-4 md:grid-cols-2"><FormField id="onboarding-year" label="Ano ou nível de ensino" helpText="Opcional"><select value={profile.year ?? ""} onChange={(event) => setProfile((value) => ({ ...value, year: event.target.value }))}><option value="">Selecionar</option>{years.map((year) => <option key={year}>{year}</option>)}</select></FormField><FormField id="onboarding-course" label="Curso" helpText="Opcional"><input value={profile.course ?? ""} onChange={(event) => setProfile((value) => ({ ...value, course: event.target.value }))} /></FormField></div><div className="flex flex-wrap gap-2"><button className="sf-button-primary" disabled={saving} type="submit">{saving ? "A guardar..." : "Guardar perfil"}</button><button className="sf-button-secondary" disabled={saving} onClick={onDeferred} type="button">Agora não</button></div></form></section>;
}
