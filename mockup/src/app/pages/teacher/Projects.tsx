import { useState } from "react";

export function Projects() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const projects = [
    {
      id: 1,
      title: "Projeto Final - Base de Dados",
      class: "12º IG",
      dueDate: "30/05/2026",
      submissions: 18,
      total: 25,
    },
    {
      id: 2,
      title: "Aplicação Web - E-commerce",
      class: "11º IG",
      dueDate: "15/06/2026",
      submissions: 12,
      total: 22,
    },
    {
      id: 3,
      title: "Sistema de Gestão",
      class: "12º IG",
      dueDate: "20/05/2026",
      submissions: 20,
      total: 25,
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Projetos</h1>
          <p className="text-muted-foreground mt-1">Gere os projetos das tuas turmas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Novo Projeto
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-card border-2 border-border rounded-lg p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary">{project.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.class} • Entrega: {project.dueDate}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Entregas</span>
                    <span className="text-primary font-medium">
                      {project.submissions}/{project.total}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{
                        width: `${(project.submissions / project.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
                  Ver Entregas
                </button>
                <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Criar Novo Projeto</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Título do Projeto
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: Projeto Final"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Turma
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>12º IG</option>
                  <option>11º IG</option>
                  <option>10º IG</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Data de Entrega
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Descrição
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3}
                  placeholder="Descreve o projeto..."
                ></textarea>
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
