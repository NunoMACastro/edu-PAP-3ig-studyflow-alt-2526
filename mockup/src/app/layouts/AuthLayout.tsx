import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-accent">StudyFlow</h1>
          <p className="text-primary mt-2">Plataforma Inteligente de Aprendizagem</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
