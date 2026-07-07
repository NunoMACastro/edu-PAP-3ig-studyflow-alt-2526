/**
 * Documenta a responsabilidade de app dentro de real_dev.
 */
import { ActionFeedbackProvider } from "./features/mf5/action-feedback.js";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegisterPage } from "./pages/auth/RegisterPage.js";
import { ProtectedRoutes } from "./routes/protectedRoutes.js";
import { useSession } from "./hooks/useSession.js";

/**
 * Componente raiz da aplicação.
 *
 * @returns Árvore React correspondente à rota atual.
 */
export function App() {
    const session = useSession();
    const pathname = window.location.pathname;

    if (pathname === "/registar") return <RegisterPage />;

    if (session.loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-slate-600">A carregar sessão...</p>
            </main>
        );
    }

    if (!session.user) {
        return <LoginPage onLoggedIn={session.refresh} />;
    }

    return (
        <ActionFeedbackProvider>
            {/* O provider fica dentro da sessao para nao misturar feedback protegido com paginas publicas. */}
            <ProtectedRoutes user={session.user} onLogout={session.signOut} />
        </ActionFeedbackProvider>
    );
}
