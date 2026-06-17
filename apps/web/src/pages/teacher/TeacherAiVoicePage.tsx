/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    getTeacherAiVoice,
    TeacherAiVoice,
    updateTeacherAiVoice,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherAiVoicePageProps = {
    subjectId: string;
};

/**
 * Página de configuração da voz textual docente.
 */
export function TeacherAiVoicePage({ subjectId }: TeacherAiVoicePageProps) {
    const [voice, setVoice] = useState<TeacherAiVoice | null>(null);
    const [rulesText, setRulesText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getTeacherAiVoice(subjectId)
            .then((loadedVoice) => {
                setVoice(loadedVoice);
                setRulesText(loadedVoice.rules.join("\n"));
            })
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar voz."),
            );
    }, [subjectId]);

    /**
     * Trata a acao do utilizador e sincroniza o estado da interface.
     *
     * @param event Evento da interface que dispara a acao.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        if (!voice) return;
        setError(null);
        setSuccess(null);
        try {
            const updated = await updateTeacherAiVoice(subjectId, {
                tone: voice.tone,
                detailLevel: voice.detailLevel,
                rules: rulesText.split("\n"),
            });
            setVoice(updated);
            setRulesText(updated.rules.join("\n"));
            setSuccess("Voz docente guardada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar voz.");
        }
    }

    if (!voice) return <p className="text-sm text-slate-600">A carregar voz...</p>;

    return (
        <form className="sf-panel mx-auto max-w-2xl space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h1 className="text-xl font-bold">Voz da IA docente</h1>
            {error ? <p className="sf-error">{error}</p> : null}
            {success ? <p className="sf-success">{success}</p> : null}
            <label className="block">
                Tom
                <select value={voice.tone} onChange={(event) => setVoice({ ...voice, tone: event.target.value as TeacherAiVoice["tone"] })}>
                    <option value="CALM">Calmo</option>
                    <option value="DIRECT">Direto</option>
                    <option value="SOCRATIC">Socrático</option>
                </select>
            </label>
            <label className="block">
                Detalhe
                <select value={voice.detailLevel} onChange={(event) => setVoice({ ...voice, detailLevel: event.target.value as TeacherAiVoice["detailLevel"] })}>
                    <option value="SHORT">Curto</option>
                    <option value="BALANCED">Equilibrado</option>
                    <option value="DETAILED">Detalhado</option>
                </select>
            </label>
            <label className="block">
                Regras
                <textarea rows={6} value={rulesText} onChange={(event) => setRulesText(event.target.value)} />
            </label>
            <button className="sf-button-primary">Guardar</button>
        </form>
    );
}
