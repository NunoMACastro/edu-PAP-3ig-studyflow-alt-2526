/**
 * Implementa um componente React reutilizavel para study.
 */
import { FormEvent, useState } from "react";
import { StudyArea, updateStudyAreaVoice } from "../../lib/apiClient.js";

/**
 * Props do componente React de rotinas e objetivos de estudo; mantêm explícitas as dependências vindas da página.
 */
type StudyAreaVoiceFormProps = {
    area: StudyArea;
    onSaved: (area: StudyArea) => void;
};

/**
 * Formulário de voz pedagógica da área.
 *
 * @param props Área atual e callback de atualização.
 * @returns Formulário de tom, detalhe e notas.
 */
export function StudyAreaVoiceForm({ area, onSaved }: StudyAreaVoiceFormProps) {
    const [voiceTone, setVoiceTone] = useState(area.voiceTone ?? "step_by_step");
    const [voiceDetailLevel, setVoiceDetailLevel] = useState(
        area.voiceDetailLevel ?? "normal",
    );
    const [voiceNotes, setVoiceNotes] = useState(area.voiceNotes ?? "");
    const [error, setError] = useState<string | null>(null);

    /**
     * Guarda preferências de voz.
     *
     * @param event Evento de submissão.
     * @returns Promise resolvida depois de guardar.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        try {
            onSaved(
                await updateStudyAreaVoice(area._id, {
                    voiceTone,
                    voiceDetailLevel,
                    voiceNotes,
                }),
            );
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
        }
    }

    return (
        <form className="sf-panel space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <h2 className="text-lg font-bold">Voz da IA</h2>
            {error ? <p className="sf-error">{error}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="voiceTone">Tom</label>
                    <select id="voiceTone" value={voiceTone} onChange={(event) => setVoiceTone(event.target.value)}>
                        <option value="simple">Simples</option>
                        <option value="rigorous">Rigoroso</option>
                        <option value="step_by_step">Passo a passo</option>
                        <option value="examples_first">Exemplos primeiro</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="voiceDetailLevel">Detalhe</label>
                    <select id="voiceDetailLevel" value={voiceDetailLevel} onChange={(event) => setVoiceDetailLevel(event.target.value)}>
                        <option value="short">Curto</option>
                        <option value="normal">Normal</option>
                        <option value="detailed">Detalhado</option>
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="voiceNotes">Notas</label>
                <textarea id="voiceNotes" rows={3} value={voiceNotes} onChange={(event) => setVoiceNotes(event.target.value)} />
            </div>
            <button className="sf-button-primary" type="submit">Guardar voz</button>
        </form>
    );
}
