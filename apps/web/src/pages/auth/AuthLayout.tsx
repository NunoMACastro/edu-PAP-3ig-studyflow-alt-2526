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
 * Apresenta a marca StudyFlow numa composição editorial e responsiva.
 *
 * @param props Modo da pagina e conteudo do formulario.
 * @returns Layout responsivo de autenticacao.
 */
export function AuthLayout({ mode, children }: AuthLayoutProps): ReactNode {
    const copy = authCopy[mode];

    return (
        <main className="grid min-h-screen overflow-hidden bg-studyflow-page text-studyflow-text lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
            <h1 className="sr-only">StudyFlow</h1>

            <section
                aria-label="Identidade StudyFlow"
                className="relative hidden min-h-screen items-center justify-center overflow-hidden border-r border-studyflow-border/10 bg-studyflow-card/35 p-12 lg:flex xl:p-16"
            >
                <div
                    aria-hidden="true"
                    className="absolute -left-32 -top-36 h-[30rem] w-[30rem] rounded-full bg-studyflow-brand/15 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="absolute -bottom-44 -right-28 h-[34rem] w-[34rem] rounded-full border border-studyflow-brand/20 bg-studyflow-card/45 blur-2xl"
                />

                <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
                    <img
                        alt=""
                        aria-hidden="true"
                        className="h-56 w-56 rounded-[2.5rem] shadow-2xl shadow-black/25 xl:h-72 xl:w-72"
                        src="/assets/studyflow-logo.svg"
                    />
                    <p className="mt-10 max-w-lg text-xl leading-8 text-studyflow-text/70">
                        Plataforma Inteligente de Aprendizagem
                    </p>
                </div>
            </section>

            <section className="relative flex min-h-screen items-center px-4 py-8 sm:px-8 lg:px-12 xl:px-20">
                <div
                    aria-hidden="true"
                    className="absolute right-0 top-0 h-72 w-72 rounded-full bg-studyflow-brand/10 blur-3xl lg:hidden"
                />
                <div className="relative mx-auto w-full max-w-md">
                    <header className="mb-8 text-center lg:hidden">
                        <img
                            alt=""
                            aria-hidden="true"
                            className="mx-auto h-24 w-24 rounded-2xl shadow-xl shadow-black/20"
                            src="/assets/studyflow-logo.svg"
                        />
                        <p className="mt-4 text-sm text-studyflow-text/65 sm:text-base">
                            Plataforma Inteligente de Aprendizagem
                        </p>
                    </header>

                    <section aria-label={copy.panelLabel}>
                        {children}
                    </section>
                </div>
            </section>
        </main>
    );
}
