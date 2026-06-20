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
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form className="sf-panel w-full max-w-md space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <div>
                    <h1 className="text-2xl font-bold text-teal-800">StudyFlow</h1>
                    <p className="mt-1 text-sm text-slate-600">Criar conta de aluno.</p>
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
                <a className="block text-center text-sm font-medium text-teal-700 hover:text-teal-900" href="/login">
                    Voltar ao login
                </a>
            </form>
        </main>
    );
}
