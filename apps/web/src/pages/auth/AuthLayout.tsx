/**
 * Define o layout visual comum para paginas publicas de autenticacao.
 */
import type { ReactNode } from "react";

type AuthMode = "login" | "register";

const authCopy: Record<AuthMode, { panelLabel: string }> = {
    login: {
        panelLabel: "Formulario de login",
    },
    register: {
        panelLabel: "Formulario de registo",
    },
};

type AuthLayoutProps = {
    mode: AuthMode;
    children: ReactNode;
};

/**
 * Apresenta a marca StudyFlow e centra o formulário numa composição simples.
 *
 * @param props Modo da pagina e conteudo do formulario.
 * @returns Layout responsivo de autenticacao.
 */
export function AuthLayout({ mode, children }: AuthLayoutProps): ReactNode {
    const copy = authCopy[mode];

    return (
        <main className="flex min-h-screen items-center bg-studyflow-page px-4 py-8 text-studyflow-text sm:px-6">
            <div className="mx-auto w-full max-w-md">
                <header className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                        <img
                            alt=""
                            aria-hidden="true"
                            className="h-14 w-14 rounded-lg"
                            src="/assets/studyflow-logo.svg"
                        />
                        <h1
                            className="text-4xl font-bold tracking-tight text-studyflow-brandText"
                            id="studyflow-auth-brand"
                        >
                            StudyFlow
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-studyflow-text/80 sm:text-base">
                        Plataforma Inteligente de Aprendizagem
                    </p>
                </header>

                <section aria-label={copy.panelLabel}>
                    {children}
                </section>
            </div>
        </main>
    );
}
