import { Link, useNavigate } from "react-router";
import { useState } from "react";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wireframe: redirect to student dashboard
    navigate("/student");
  };

  return (
    <div className="bg-card rounded-lg border-2 border-border p-8">
      <h2 className="text-2xl font-bold text-primary mb-6">Entrar</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="seuemail@exemplo.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-white py-2 rounded-md hover:opacity-90"
        >
          Entrar
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Ainda não tens conta?{" "}
          <Link to="/auth/register" className="text-accent font-medium hover:underline">
            Registar
          </Link>
        </p>
      </div>
    </div>
  );
}
