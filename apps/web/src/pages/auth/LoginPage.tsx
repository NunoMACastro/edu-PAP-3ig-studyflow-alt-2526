/**
 * Implementa uma pagina React de auth com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { login } from "../../lib/apiClient.js";

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
            await login({ email, password });
            await onLoggedIn();
            window.location.href = "/app/estudo";
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Login falhou.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form className="sf-panel w-full max-w-md space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                <div>
                    <h1 className="text-2xl font-bold text-teal-800">StudyFlow</h1>
                    <p className="mt-1 text-sm text-slate-600">Entrar na tua área de estudo.</p>
                </div>
                {error ? <p className="sf-error">{error}</p> : null}
                <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
                <div className="space-y-2">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </div>
                <button className="sf-button-primary w-full" type="submit" disabled={loading}>
                    {loading ? "A entrar..." : "Entrar"}
                </button>
                <a className="block text-center text-sm font-medium text-teal-700 hover:text-teal-900" href="/registar">
                    Criar conta
                </a>
            </form>
        </main>
    );
}
