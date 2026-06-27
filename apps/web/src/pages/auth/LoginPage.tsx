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
        <main className="flex min-h-screen items-center justify-center bg-studyflow-page px-4 py-10">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-studyflow-brand">StudyFlow</h1>
                    <p className="mt-3 text-base text-slate-700">Plataforma Inteligente de Aprendizagem</p>
                </div>

                <form className="sf-panel space-y-5 p-8" onSubmit={(event) => void handleSubmit(event)}>
                    <div>
                        <h2 className="text-2xl font-bold text-studyflow-navy">Entrar</h2>
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
                    <p className="text-center text-sm text-slate-500">
                        Ainda não tens conta?{" "}
                        <a className="font-semibold text-studyflow-brand hover:text-studyflow-brandHover" href="/registar">
                            Registar
                        </a>
                    </p>
                </form>
            </div>
        </main>
    );
}
