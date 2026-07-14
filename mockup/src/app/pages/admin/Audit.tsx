import { useState } from "react";

export function Audit() {
  const [filter, setFilter] = useState<"all" | "user" | "material" | "ai" | "system">("all");

  const auditLogs = [
    {
      id: 1,
      type: "user",
      action: "Utilizador criado",
      user: "Admin",
      target: "João Silva",
      timestamp: "21/04/2026 14:30",
      details: "Novo aluno registado",
    },
    {
      id: 2,
      type: "material",
      action: "Material enviado",
      user: "Prof. Maria Santos",
      target: "Matemática - Cap 5.pdf",
      timestamp: "21/04/2026 13:15",
      details: "Material aprovado automaticamente",
    },
    {
      id: 3,
      type: "ai",
      action: "Quota IA excedida",
      user: "Sistema",
      target: "Turma 12º IG",
      timestamp: "21/04/2026 12:00",
      details: "Limite mensal atingido",
    },
    {
      id: 4,
      type: "system",
      action: "Backup criado",
      user: "Sistema",
      target: "Base de Dados",
      timestamp: "21/04/2026 03:00",
      details: "Backup automático diário",
    },
    {
      id: 5,
      type: "user",
      action: "Login",
      user: "João Silva",
      target: "-",
      timestamp: "20/04/2026 18:45",
      details: "Login bem-sucedido",
    },
  ];

  const filteredLogs = filter === "all" ? auditLogs : auditLogs.filter((log) => log.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Auditoria</h1>
        <p className="text-muted-foreground mt-1">Histórico completo de atividades do sistema</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md ${
            filter === "all"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter("user")}
          className={`px-4 py-2 rounded-md ${
            filter === "user"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Utilizadores
        </button>
        <button
          onClick={() => setFilter("material")}
          className={`px-4 py-2 rounded-md ${
            filter === "material"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Materiais
        </button>
        <button
          onClick={() => setFilter("ai")}
          className={`px-4 py-2 rounded-md ${
            filter === "ai"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          IA
        </button>
        <button
          onClick={() => setFilter("system")}
          className={`px-4 py-2 rounded-md ${
            filter === "system"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Sistema
        </button>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button className="px-4 py-2 border border-border rounded-md hover:bg-muted">
          Exportar Relatório
        </button>
      </div>

      {/* Audit Table */}
      <div className="bg-card border-2 border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Data/Hora</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Tipo</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Ação</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Utilizador</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Alvo</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted">
                <td className="px-6 py-4 text-sm text-primary">{log.timestamp}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      log.type === "user"
                        ? "bg-accent/10 text-accent"
                        : log.type === "material"
                        ? "bg-accent/10 text-accent"
                        : log.type === "ai"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-muted text-primary"
                    }`}
                  >
                    {log.type === "user"
                      ? "Utilizador"
                      : log.type === "material"
                      ? "Material"
                      : log.type === "ai"
                      ? "IA"
                      : "Sistema"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-primary">{log.action}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{log.user}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{log.target}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
