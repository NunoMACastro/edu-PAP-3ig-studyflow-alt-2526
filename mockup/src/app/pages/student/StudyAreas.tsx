import { Link } from "react-router";
import { useState } from "react";

export function StudyAreas() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [areaName, setAreaName] = useState("");

  const studyAreas = [
    { id: 1, name: "Matemática", materials: 12, progress: 65, lastStudy: "Há 2 horas" },
    { id: 2, name: "Português", materials: 8, progress: 45, lastStudy: "Há 1 dia" },
    { id: 3, name: "Física", materials: 15, progress: 80, lastStudy: "Há 30 min" },
    { id: 4, name: "Química", materials: 10, progress: 55, lastStudy: "Há 3 dias" },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    setAreaName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Áreas de Estudo</h1>
          <p className="text-muted-foreground mt-1">Organize o teu estudo por disciplina ou tema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Nova Área
        </button>
      </div>

      {/* Study Areas Grid */}
      <div className="grid grid-cols-2 gap-4">
        {studyAreas.map((area) => (
          <Link
            key={area.id}
            to={`/student/study-areas/${area.id}`}
            className="bg-card border-2 border-border rounded-lg p-6 hover:border-accent transition-colors"
          >
            <h3 className="text-xl font-bold text-primary mb-2">{area.name}</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{area.materials} materiais</span>
                <span className="text-muted-foreground">Última atividade: {area.lastStudy}</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-primary font-medium">{area.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${area.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-sm text-accent hover:underline">Abrir →</div>
          </Link>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Criar Nova Área de Estudo</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nome da Área
                </label>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: Matemática, História..."
                  required
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
