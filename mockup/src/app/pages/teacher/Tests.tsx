import { useState } from "react";

export function Tests() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tests = [
    {
      id: 1,
      title: "Teste: Álgebra Linear",
      subject: "Matemática",
      class: "12º IG",
      date: "25/04/2026",
      questions: 20,
      completed: 18,
      total: 25,
    },
    {
      id: 2,
      title: "Quiz: Funções",
      subject: "Matemática",
      class: "12º IG",
      date: "20/04/2026",
      questions: 10,
      completed: 25,
      total: 25,
    },
    {
      id: 3,
      title: "Teste: SQL Avançado",
      subject: "Bases de Dados",
      class: "11º IG",
      date: "28/04/2026",
      questions: 15,
      completed: 10,
      total: 22,
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
          <h1 className="text-3xl font-bold text-primary">Testes e Quizzes</h1>
          <p className="text-muted-foreground mt-1">Cria e gere avaliações para as tuas turmas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Criar Teste
        </button>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-card border-2 border-border rounded-lg p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary">{test.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {test.subject} • {test.class} • {test.date}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{test.questions} perguntas</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Concluídos</span>
                    <span className="text-primary font-medium">
                      {test.completed}/{test.total}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{
                        width: `${(test.completed / test.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
                  Ver Resultados
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
            <h2 className="text-xl font-bold text-primary mb-4">Criar Novo Teste</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: Teste de Álgebra"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>Teste Oficial</option>
                  <option>Quiz Rápido</option>
                  <option>Mini-Teste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Disciplina
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>Matemática</option>
                  <option>Programação</option>
                  <option>Bases de Dados</option>
                </select>
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
                  Data
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Número de Perguntas
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="20"
                  min="1"
                />
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
