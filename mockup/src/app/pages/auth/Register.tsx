import { Link, useNavigate } from "react-router";
import { useState } from "react";

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wireframe: redirect to student dashboard
    navigate("/student");
  };

  return (
    <div className="bg-card rounded-lg border-2 border-border p-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Criar Conta</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="João Silva"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="seuemail@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Tipo de Conta
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="student">Aluno</option>
            <option value="teacher">Professor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Confirmar Password
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-white py-2 rounded-md hover:opacity-90"
        >
          Criar Conta
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Já tens conta?{" "}
          <Link to="/auth/login" className="text-accent font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
