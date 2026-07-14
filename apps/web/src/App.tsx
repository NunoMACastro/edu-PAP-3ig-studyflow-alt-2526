/**
 * Documenta a responsabilidade de app dentro de real_dev.
 */
import { ActionFeedbackProvider } from "./features/mf5/action-feedback.js";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegisterPage } from "./pages/auth/RegisterPage.js";
import { ProtectedRoutes } from "./routes/protectedRoutes.js";
import { useSession } from "./hooks/useSession.js";
import { AppErrorBoundary } from "./components/errors/AppErrorBoundary.js";
import { getSafeReturnTo } from "./routes/safeReturnTo.js";
import { EmptyState, InlineNotice } from "./components/ui/CalmUi.js";

/**
 * Componente raiz da aplicação.
 *
 * @returns Árvore React correspondente à rota atual.
 */
export function App() {
    const session = useSession();

    return (
        <BrowserRouter>
            <AppErrorBoundary>
                {session.loading ? <SessionLoading /> : null}

            {session.status === "unavailable" ? (
                <ServiceUnavailable
                    message={session.error}
                    onRetry={session.refresh}
                />
            ) : null}

                {session.status === "anonymous" ? (
                    <AnonymousRoutes onLoggedIn={session.refresh} />
                ) : null}

                {session.status === "authenticated" && session.user ? (
                    <ActionFeedbackProvider>
                        {/* O provider fica dentro da sessão para não misturar feedback protegido com páginas públicas. */}
                        <ProtectedRoutes
                            user={session.user}
                            onLogout={session.signOut}
                        />
                    </ActionFeedbackProvider>
                ) : null}
            </AppErrorBoundary>
        </BrowserRouter>
    );
}

/**
 * Mantém a rota pretendida apenas quando é um path interno autenticado.
 */
function AnonymousRoutes({
    onLoggedIn,
}: {
    onLoggedIn: () => Promise<void>;
}) {
    const location = useLocation();
    const returnTo = getSafeReturnTo(
        `${location.pathname}${location.search}${location.hash}`,
    );
    return (
        <Routes>
            <Route path="/registar" element={<RegisterPage />} />
            <Route
                path="/login"
                element={<LoginPage onLoggedIn={onLoggedIn} />}
            />
            <Route
                path="*"
                element={
                    <Navigate
                        replace
                        state={returnTo ? { returnTo } : undefined}
                        to="/login"
                    />
                }
            />
        </Routes>
    );
}

/**
 * Estado neutro enquanto `/api/auth/me` ainda não decidiu a sessão.
 *
 * @returns Conteúdo acessível sem expor prematuramente rotas protegidas.
 */
function SessionLoading() {
    return (
        <main
            aria-busy="true"
            className="flex min-h-screen items-center justify-center"
        >
            <InlineNotice>A carregar sessão...</InlineNotice>
        </main>
    );
}

/**
 * Distingue uma API indisponível de uma sessão anónima e permite retry explícito.
 *
 * @param props Mensagem pública e ação de nova tentativa.
 * @returns Estado de erro operacional controlado.
 */
function ServiceUnavailable({
    message,
    onRetry,
}: {
    message: string | null;
    onRetry: () => Promise<void>;
}) {
    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-lg" role="alert"><EmptyState
                icon="info"
                title="Serviço temporariamente indisponível"
                description={message ?? "Não foi possível validar a sessão."}
                action={<button
                    className="sf-button-primary"
                    onClick={() => void onRetry()}
                    type="button"
                >
                    Tentar novamente
                </button>}
            /></div>
        </main>
    );
}
