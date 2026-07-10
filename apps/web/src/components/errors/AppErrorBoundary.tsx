/**
 * Contém falhas de renderização e de chunks lazy numa vista recuperável.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { failed: boolean };

/**
 * Error boundary global: evita um ecrã branco e não expõe stacks ao utilizador.
 */
export class AppErrorBoundary extends Component<
    AppErrorBoundaryProps,
    AppErrorBoundaryState
> {
    state: AppErrorBoundaryState = { failed: false };

    static getDerivedStateFromError(): AppErrorBoundaryState {
        return { failed: true };
    }

    componentDidCatch(_error: Error, _info: ErrorInfo): void {
        // A versão PAP local não envia telemetria nem conteúdo potencialmente privado.
    }

    render(): ReactNode {
        if (!this.state.failed) return this.props.children;
        return (
            <main className="flex min-h-screen items-center justify-center px-4">
                <section className="sf-panel max-w-lg space-y-4" role="alert">
                    <h1 className="text-xl font-bold">
                        Não foi possível apresentar esta página
                    </h1>
                    <p className="text-sm text-studyflow-text">
                        Recarrega a aplicação. Se o problema continuar, volta à página
                        inicial.
                    </p>
                    <button
                        className="sf-button-primary min-h-11"
                        onClick={() => window.location.assign("/")}
                        type="button"
                    >
                        Voltar ao início
                    </button>
                </section>
            </main>
        );
    }
}
