import { useState } from "react";

export function Users() {
  const [filter, setFilter] = useState<"all" | "student" | "teacher" | "admin">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const users = [
    {
      id: 1,
      name: "João Silva",
      email: "joao.silva@escola.pt",
      role: "student",
      class: "12º IG",
      status: "active",
      lastActive: "Há 2 horas",
    },
    {
      id: 2,
      name: "Prof. Maria Santos",
      email: "maria.santos@escola.pt",
      role: "teacher",
      class: "-",
      status: "active",
      lastActive: "Há 1 hora",
    },
    {
      id: 3,
      name: "Ana Pereira",
      email: "ana.pereira@escola.pt",
      role: "student",
      class: "11º IG",
      status: "active",
      lastActive: "Há 5 horas",
    },
    {
      id: 4,
      name: "Pedro Costa",
      email: "pedro.costa@escola.pt",
      role: "student",
      class: "12º IG",
      status: "inactive",
      lastActive: "Há 5 dias",
    },
  ];

  const filteredUsers = filter === "all" ? users : users.filter((u) => u.role === filter);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Utilizadores</h1>
          <p className="text-muted-foreground mt-1">Gere todos os utilizadores do sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Novo Utilizador
        </button>
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
          Todos ({users.length})
        </button>
        <button
          onClick={() => setFilter("student")}
          className={`px-4 py-2 rounded-md ${
            filter === "student"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Alunos ({users.filter((u) => u.role === "student").length})
        </button>
        <button
          onClick={() => setFilter("teacher")}
          className={`px-4 py-2 rounded-md ${
            filter === "teacher"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Professores ({users.filter((u) => u.role === "teacher").length})
        </button>
        <button
          onClick={() => setFilter("admin")}
          className={`px-4 py-2 rounded-md ${
            filter === "admin"
              ? "bg-accent text-white"
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Admins ({users.filter((u) => u.role === "admin").length})
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-card border-2 border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Papel</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Turma</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-primary">
                Última Atividade
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-primary">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted">
                <td className="px-6 py-4 text-sm text-primary">{user.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.role === "teacher"
                        ? "bg-accent/10 text-accent"
                        : user.role === "admin"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-muted text-primary"
                    }`}
                  >
                    {user.role === "student"
                      ? "Aluno"
                      : user.role === "teacher"
                      ? "Professor"
                      : "Admin"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.class}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === "active"
                        ? "bg-accent/10 text-accent"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {user.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.lastActive}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <button className="text-muted-foreground hover:underline mr-3">Editar</button>
                  <button className="text-destructive hover:underline">Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Criar Novo Utilizador</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Papel</label>
                <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
