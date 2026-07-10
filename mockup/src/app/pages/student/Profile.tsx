import { useState } from "react";

export function Profile() {
  const [formData, setFormData] = useState({
    name: "João Silva",
    email: "joao.silva@escola.pt",
    year: "12º",
    course: "Informática de Gestão",
    class: "12º IG",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gere as tuas informações pessoais</p>
      </div>

      {/* Profile Form */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Informações Pessoais</h2>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Ano
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Curso
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Turma
            </label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
          >
            Guardar Alterações
          </button>
        </form>
      </div>

      {/* Study Goals */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Objetivos de Estudo</h2>
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary">Estudar 2 horas por dia</span>
              <span className="text-xs text-accent font-medium">Ativo</span>
            </div>
          </div>
          <div className="border border-border rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-primary">Concluir 3 quizzes por semana</span>
              <span className="text-xs text-accent font-medium">Ativo</span>
            </div>
          </div>
        </div>
        <button className="mt-4 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted">
          + Adicionar Objetivo
        </button>
      </div>

      {/* Study Routine */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Rotina de Estudo</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-primary">Segunda-feira</span>
            <span className="text-sm text-muted-foreground">15:00 - 17:00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-primary">Quarta-feira</span>
            <span className="text-sm text-muted-foreground">16:00 - 18:00</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-primary">Sexta-feira</span>
            <span className="text-sm text-muted-foreground">14:00 - 16:00</span>
          </div>
        </div>
        <button className="mt-4 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted">
          Editar Rotina
        </button>
      </div>
    </div>
  );
}
