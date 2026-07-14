/**
 * Implementa um componente React reutilizavel para study.
 */
import { FormEvent, useState } from "react";
import { FormField } from "../forms/FormField.js";
import { SectionHeader } from "../ui/CalmUi.js";
import { Surface } from "../ui/Surface.js";
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
        <Surface as="form" className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <SectionHeader description="Define o tom e o nível de detalhe usados nesta área." title="Voz da IA" />
            {error ? <p className="sf-error" role="alert">{error}</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
                <FormField id="voiceTone" label="Tom">
                    <select value={voiceTone} onChange={(event) => setVoiceTone(event.target.value)}>
                        <option value="simple">Simples</option>
                        <option value="rigorous">Rigoroso</option>
                        <option value="step_by_step">Passo a passo</option>
                        <option value="examples_first">Exemplos primeiro</option>
                    </select>
                </FormField>
                <FormField id="voiceDetailLevel" label="Detalhe">
                    <select value={voiceDetailLevel} onChange={(event) => setVoiceDetailLevel(event.target.value)}>
                        <option value="short">Curto</option>
                        <option value="normal">Normal</option>
                        <option value="detailed">Detalhado</option>
                    </select>
                </FormField>
            </div>
            <FormField id="voiceNotes" label="Notas">
                <textarea rows={3} value={voiceNotes} onChange={(event) => setVoiceNotes(event.target.value)} />
            </FormField>
            <button className="sf-button-primary" type="submit">Guardar voz</button>
        </Surface>
    );
}
