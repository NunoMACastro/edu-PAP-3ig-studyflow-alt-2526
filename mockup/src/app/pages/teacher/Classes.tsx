import { Link } from "react-router";
import { useState } from "react";

export function Classes() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [className, setClassName] = useState("");

  const classes = [
    {
      id: 1,
      name: "12º IG",
      year: "12º",
      course: "Informática de Gestão",
      students: 25,
      subjects: 3,
    },
    {
      id: 2,
      name: "11º IG",
      year: "11º",
      course: "Informática de Gestão",
      students: 22,
      subjects: 2,
    },
    {
      id: 3,
      name: "10º IG",
      year: "10º",
      course: "Informática de Gestão",
      students: 28,
      subjects: 2,
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    setClassName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Turmas</h1>
          <p className="text-muted-foreground mt-1">Gere as tuas turmas e alunos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Nova Turma
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Link
            key={cls.id}
            to={`/teacher/classes/${cls.id}`}
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-accent transition-colors"
          >
            <h3 className="text-2xl font-bold text-primary mb-2">{cls.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{cls.course}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alunos</span>
                <span className="text-primary font-medium">{cls.students}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disciplinas</span>
                <span className="text-primary font-medium">{cls.subjects}</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-accent hover:underline">Ver detalhes →</div>
          </Link>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Criar Nova Turma</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nome da Turma
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: 12º IG"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Ano
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                  <option>10º</option>
                  <option>11º</option>
                  <option>12º</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Curso
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: Informática de Gestão"
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
