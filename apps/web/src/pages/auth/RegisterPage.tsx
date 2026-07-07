/**
 * Implementa uma pagina React de auth com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { registerStudent } from "../../lib/apiClient.js";

/**
 * Página de registo de aluno.
 *
 * @returns Formulário do BK-MF0-01 com validação básica no frontend.
 */
export function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Submete o registo à API.
     *
     * @param event Evento de formulário.
     * @returns Promise resolvida depois da resposta do backend.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await registerStudent({ email, password, confirmPassword });
            setSuccess("Conta criada. Já podes entrar.");
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Registo falhou.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-studyflow-page px-4 py-10">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-studyflow-brand">StudyFlow</h1>
                    <p className="mt-3 text-base text-slate-700">Plataforma Inteligente de Aprendizagem</p>
                </div>

                <form className="sf-panel space-y-5 p-8" onSubmit={(event) => void handleSubmit(event)}>
                    <div>
                        <h2 className="text-2xl font-bold text-studyflow-navy">Registar</h2>
                    </div>
                    {error ? <p className="sf-error">{error}</p> : null}
                    {success ? <p className="sf-success">{success}</p> : null}
                    <div className="space-y-2">
                        <label htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="confirmPassword">Confirmar password</label>
                        <input id="confirmPassword" type="password" minLength={10} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                    </div>
                    <button className="sf-button-primary w-full" type="submit" disabled={loading}>
                        {loading ? "A criar..." : "Registar"}
                    </button>
                    <p className="text-center text-sm text-slate-500">
                        Já tens conta?{" "}
                        <a className="font-semibold text-studyflow-brand hover:text-studyflow-brandHover" href="/login">
                            Entrar
                        </a>
                    </p>
                </form>
            </div>
        </main>
    );
}
