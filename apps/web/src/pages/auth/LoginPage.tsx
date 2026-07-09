/**
 * Implementa uma pagina React de auth com estado, carregamento e ações do utilizador.
 */
import { FormEvent, useState } from "react";
import { login } from "../../lib/apiClient.js";

const studyflowLogoUrl = new URL("../../assets/studyflow-logo-temp.jpg", import.meta.url).href;

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
        <main className="relative flex min-h-screen overflow-hidden bg-studyflow-page px-4 py-8 text-studyflow-text sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-br from-studyflow-navyHover via-studyflow-page to-studyflow-brand opacity-60" />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-studyflow-navyHover to-transparent opacity-60" />
            </div>

            <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_440px]">
                <section className="mx-auto flex w-full max-w-sm flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border border-studyflow-border bg-studyflow-card shadow-2xl sm:h-32 sm:w-32">
                        <img aria-hidden="true" className="h-full w-full object-cover" src={studyflowLogoUrl} alt="" />
                    </div>
                    <h1 className="sr-only">StudyFlow</h1>
                    <p className="mt-6 max-w-xs text-base font-medium text-studyflow-muted">Plataforma Inteligente de Aprendizagem</p>
                </section>

                <form
                    className="sf-panel w-full space-y-5 p-6 shadow-2xl sm:p-8"
                    onSubmit={(event) => void handleSubmit(event)}
                >
                    <div className="border-b border-studyflow-border pb-5">
                        <h2 className="text-2xl font-bold text-studyflow-text">Entrar</h2>
                    </div>
                    {error ? <p className="sf-error">{error}</p> : null}
                    <div className="space-y-2">
                        <label htmlFor="email">
                            Email
                        </label>
                        <input
                            className="h-12 px-4 text-base"
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password">
                            Password
                        </label>
                        <input
                            className="h-12 px-4 text-base"
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>
                    <button className="sf-button-primary h-12 w-full shadow-xl" type="submit" disabled={loading}>
                        {loading ? "A entrar..." : "Entrar"}
                    </button>
                    <p className="text-center text-sm text-studyflow-muted">
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
