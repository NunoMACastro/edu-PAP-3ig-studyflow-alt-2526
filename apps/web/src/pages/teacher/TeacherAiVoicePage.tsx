/**
 * Implementa uma pagina React de teacher com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useEffect, useState } from "react";
import {
    deleteTeacherAiVoiceOverride,
    getClassTeacherAiVoice,
    getTeacherAiVoice,
    TeacherAiVoice,
    updateClassTeacherAiVoice,
    updateTeacherAiVoice,
} from "../../lib/apiClient.js";

/**
 * Props do componente React de teacher; mantêm explícitas as dependências vindas da página.
 */
type TeacherAiVoicePageProps = {
    subjectId: string;
};

type TeacherClassAiVoicePageProps = {
    classId: string;
};

type VoiceFormProps = {
    title: string;
    voice: TeacherAiVoice;
    rulesText: string;
    error: string | null;
    success: string | null;
    isSubjectOverride: boolean;
    onVoiceChange: (voice: TeacherAiVoice) => void;
    onRulesChange: (rules: string) => void;
    onSubmit: (event: FormEvent) => void;
    onDeleteOverride?: () => void;
};

/**
 * Página de configuração da voz textual base da turma.
 */
export function TeacherClassAiVoicePage({ classId }: TeacherClassAiVoicePageProps) {
    const [voice, setVoice] = useState<TeacherAiVoice | null>(null);
    const [rulesText, setRulesText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        getClassTeacherAiVoice(classId)
            .then((loadedVoice) => {
                setVoice(loadedVoice);
                setRulesText(loadedVoice.rules.join("\n"));
            })
            .catch((caught: unknown) =>
                setError(caught instanceof Error ? caught.message : "Erro ao carregar voz."),
            );
    }, [classId]);

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
            const updated = await updateClassTeacherAiVoice(classId, {
                tone: voice.tone,
                detailLevel: voice.detailLevel,
                rules: rulesText.split("\n"),
            });
            setVoice(updated);
            setRulesText(updated.rules.join("\n"));
            setSuccess("Voz da turma guardada.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar voz.");
        }
    }

    if (!voice) return <p className="text-sm text-slate-600">A carregar voz...</p>;

    return (
        <TeacherVoiceForm
            title="Voz da IA docente"
            voice={voice}
            rulesText={rulesText}
            error={error}
            success={success}
            isSubjectOverride={false}
            onVoiceChange={setVoice}
            onRulesChange={setRulesText}
            onSubmit={(event) => void handleSubmit(event)}
        />
    );
}

/**
 * Página de configuração do override textual docente numa disciplina.
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
            setSuccess("Override da disciplina guardado.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao guardar voz.");
        }
    }

    /**
     * Remove o override da disciplina e repõe a voz herdada.
     */
    async function handleDeleteOverride(): Promise<void> {
        setError(null);
        setSuccess(null);
        try {
            const updated = await deleteTeacherAiVoiceOverride(subjectId);
            setVoice(updated);
            setRulesText(updated.rules.join("\n"));
            setSuccess("Override removido.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Erro ao remover override.");
        }
    }

    if (!voice) return <p className="text-sm text-slate-600">A carregar voz...</p>;

    return (
        <TeacherVoiceForm
            title="Voz da IA docente"
            voice={voice}
            rulesText={rulesText}
            error={error}
            success={success}
            isSubjectOverride
            onVoiceChange={setVoice}
            onRulesChange={setRulesText}
            onSubmit={(event) => void handleSubmit(event)}
            onDeleteOverride={() => void handleDeleteOverride()}
        />
    );
}

function TeacherVoiceForm({
    title,
    voice,
    rulesText,
    error,
    success,
    isSubjectOverride,
    onVoiceChange,
    onRulesChange,
    onSubmit,
    onDeleteOverride,
}: VoiceFormProps) {
    const originLabel =
        voice.source === "SUBJECT_OVERRIDE"
            ? "Disciplina"
            : voice.source === "CLASS_BASE"
                ? "Turma"
                : "Predefinida";

    return (
        <form className="sf-panel mx-auto max-w-2xl space-y-4" onSubmit={onSubmit}>
            <div>
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-sm text-slate-600">
                    Origem: {originLabel}
                </p>
            </div>
            {error ? <p className="sf-error">{error}</p> : null}
            {success ? <p className="sf-success">{success}</p> : null}
            <label className="block">
                Tom
                <select value={voice.tone} onChange={(event) => onVoiceChange({ ...voice, tone: event.target.value as TeacherAiVoice["tone"] })}>
                    <option value="CALM">Calmo</option>
                    <option value="DIRECT">Direto</option>
                    <option value="SOCRATIC">Socrático</option>
                </select>
            </label>
            <label className="block">
                Detalhe
                <select value={voice.detailLevel} onChange={(event) => onVoiceChange({ ...voice, detailLevel: event.target.value as TeacherAiVoice["detailLevel"] })}>
                    <option value="SHORT">Curto</option>
                    <option value="BALANCED">Equilibrado</option>
                    <option value="DETAILED">Detalhado</option>
                </select>
            </label>
            <label className="block">
                Regras
                <textarea rows={6} value={rulesText} onChange={(event) => onRulesChange(event.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
                <button className="sf-button-primary">
                    {isSubjectOverride ? "Guardar override" : "Guardar"}
                </button>
                {isSubjectOverride && voice.hasOverride && onDeleteOverride ? (
                    <button
                        className="sf-button-secondary"
                        onClick={onDeleteOverride}
                        type="button"
                    >
                        Remover override
                    </button>
                ) : null}
            </div>
        </form>
    );
}
