/**
 * Implementa uma pagina React de auth com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../lib/apiClient.js";
import { getDefaultPathForRole } from "../../components/layout/navigation.js";
import { AuthLayout } from "./AuthLayout.js";
import { getSafeReturnTo } from "../../routes/safeReturnTo.js";

/**
 * Props do componente React de autenticação; mantêm explícitas as dependências vindas da página.
 */
type LoginPageProps = {
    onLoggedIn: () => Promise<void>;
};

/**
 * Página de login com email/password.
 *
 * @param props Callback que recarrega a sessão depois do login.
 * @returns Formulário de autenticação alinhado com BK-MF0-02.
 */
export function LoginPage({ onLoggedIn }: LoginPageProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /**
     * Submete credenciais à API.
     *
     * @param event Evento de submissão do formulário.
     * @returns Promise resolvida quando a sessão for recarregada.
     */
    async function handleSubmit(event: FormEvent): Promise<void> {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const user = await login({ email, password });
            await onLoggedIn();
            const requestedPath = getSafeReturnTo(
                (location.state as { returnTo?: unknown } | null)?.returnTo,
            );
            navigate(requestedPath ?? getDefaultPathForRole(user.role), {
                replace: true,
            });
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Login falhou.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout mode="login">
            <form className="sf-surface sf-surface-elevated space-y-6 p-6 sm:p-8" onSubmit={(event) => void handleSubmit(event)}>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-studyflow-text">Entrar</h2>
                </div>
                {error ? (
                    <p className="sf-error" role="alert">
                        {error}
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
                        autoComplete="current-password"
                        className="sf-field"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>
                <button className="sf-button-primary min-h-11 w-full" type="submit" disabled={loading}>
                    {loading ? "A entrar..." : "Entrar"}
                </button>
                <p className="border-t border-studyflow-border/10 pt-5 text-center text-sm text-studyflow-text/75">
                    Ainda não tens conta?{" "}
                    <Link className="font-semibold text-studyflow-brandText hover:underline" to="/registar">
                        Registar
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
