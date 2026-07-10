import { Link } from "react-router";
import { useState } from "react";

export function Subjects() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subjectName, setSubjectName] = useState("");

  const subjects = [
    {
      id: 1,
      name: "Matemática",
      class: "12º IG",
      materials: 15,
      students: 25,
      aiVoice: "Configurada",
    },
    {
      id: 2,
      name: "Programação",
      class: "12º IG",
      materials: 20,
      students: 25,
      aiVoice: "Configurada",
    },
    {
      id: 3,
      name: "Bases de Dados",
      class: "11º IG",
      materials: 12,
      students: 22,
      aiVoice: "Por configurar",
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    setSubjectName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Disciplinas</h1>
          <p className="text-muted-foreground mt-1">Gere as tuas disciplinas e materiais</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Nova Disciplina
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            to={`/teacher/subjects/${subject.id}`}
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-accent transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-primary">{subject.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{subject.class}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  subject.aiVoice === "Configurada"
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {subject.aiVoice}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Materiais</span>
                <span className="text-primary font-medium">{subject.materials}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alunos</span>
                <span className="text-primary font-medium">{subject.students}</span>
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
            <h2 className="text-xl font-bold text-primary mb-4">Criar Nova Disciplina</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nome da Disciplina
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: Matemática"
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
