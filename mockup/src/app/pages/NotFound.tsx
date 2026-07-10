import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Página não encontrada</p>
        <Link
          to="/auth/login"
          className="px-6 py-3 bg-accent text-white rounded-md hover:opacity-90"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
