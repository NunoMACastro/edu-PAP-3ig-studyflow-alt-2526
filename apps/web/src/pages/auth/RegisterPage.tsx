/**
 * Implementa uma pagina React de auth com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { registerStudent } from "../../lib/apiClient.js";
import { AuthLayout } from "./AuthLayout.js";

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
        <AuthLayout mode="register">
            <form className="sf-surface sf-surface-elevated space-y-6 p-6 sm:p-8" onSubmit={(event) => void handleSubmit(event)}>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-studyflow-text">Registar</h2>
                </div>
                {error ? (
                    <p className="sf-error" role="alert">
                        {error}
                    </p>
                ) : null}
                {success ? (
                    <p className="sf-success" role="status" aria-live="polite">
                        {success}
                    </p>
                ) : null}
                <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <input
                        autoComplete="email"
                        className="sf-field"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="password">Password</label>
                    <input
                        autoComplete="new-password"
                        className="sf-field"
                        id="password"
                        type="password"
                        minLength={10}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="confirmPassword">Confirmar password</label>
                    <input
                        autoComplete="new-password"
                        className="sf-field"
                        id="confirmPassword"
                        type="password"
                        minLength={10}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                    />
                </div>
                <button className="sf-button-primary min-h-11 w-full" type="submit" disabled={loading}>
                    {loading ? "A criar..." : "Registar"}
                </button>
                <p className="border-t border-studyflow-border/10 pt-5 text-center text-sm text-studyflow-text/75">
                    Já tens conta?{" "}
                    <Link className="font-semibold text-studyflow-brandText hover:underline" to="/login">
                        Entrar
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
