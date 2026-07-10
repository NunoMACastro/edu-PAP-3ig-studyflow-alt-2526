import { useParams, Link } from "react-router";
import { useState } from "react";

export function SubjectDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"materials" | "ai" | "analytics">("materials");

  const subject = {
    id,
    name: "Matemática",
    class: "12º IG",
    students: 25,
  };

  const materials = [
    { id: 1, name: "Capítulo 1 - Funções.pdf", uploadedAt: "15/04/2026", approved: true },
    { id: 2, name: "Exercícios - Álgebra.pdf", uploadedAt: "18/04/2026", approved: true },
    { id: 3, name: "Vídeo-aula: Limites", uploadedAt: "20/04/2026", approved: false },
  ];

  const studentProgress = [
    { id: 1, name: "Ana Pereira", progress: 85, quizzes: 12, avgScore: 88 },
    { id: 2, name: "João Silva", progress: 72, quizzes: 10, avgScore: 75 },
    { id: 3, name: "Maria Santos", progress: 90, quizzes: 13, avgScore: 92 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/teacher/subjects" className="text-sm text-accent hover:underline mb-2 block">
          ← Voltar às Disciplinas
        </Link>
        <h1 className="text-3xl font-bold text-primary">{subject.name}</h1>
        <p className="text-muted-foreground mt-1">
          {subject.class} • {subject.students} alunos
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("materials")}
            className={`px-4 py-2 border-b-2 ${
              activeTab === "materials"
                ? "border-accent text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            Materiais
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 border-b-2 ${
              activeTab === "ai"
                ? "border-accent text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            Voz IA Docente
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 border-b-2 ${
              activeTab === "analytics"
                ? "border-accent text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            Progresso dos Alunos
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary">Materiais Oficiais</h2>
            <button className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90">
              + Adicionar Material
            </button>
          </div>
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex justify-between items-center border border-border rounded-lg p-4"
                >
                  <div>
                    <h3 className="font-medium text-primary">{material.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Enviado em {material.uploadedAt}
                      {material.approved && (
                        <span className="ml-2 text-accent">✓ Aprovado</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
                      Ver
                    </button>
                    {!material.approved && (
                      <button className="px-3 py-1 text-sm bg-accent text-white rounded-md hover:opacity-90">
                        Aprovar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ai" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary">Configurar Voz da IA Docente</h2>
          <div className="bg-card border-2 border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Estilo Pedagógico
              </label>
              <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                <option>Formal e rigoroso</option>
                <option>Acessível e encorajador</option>
                <option>Técnico e direto</option>
                <option>Personalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tom de Linguagem
              </label>
              <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                <option>Formal</option>
                <option>Semi-formal</option>
                <option>Informal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nível de Rigor
              </label>
              <input
                type="range"
                min="1"
                max="5"
                defaultValue="3"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Baixo</span>
                <span>Alto</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Limites de Atuação
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                rows={3}
                placeholder="Descreve os limites e regras que a IA deve seguir..."
              ></textarea>
            </div>
            <button className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90">
              Guardar Configuração
            </button>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary">Progresso dos Alunos</h2>
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <div className="space-y-3">
              {studentProgress.map((student) => (
                <div
                  key={student.id}
                  className="border border-border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-primary">{student.name}</h3>
                    <div className="text-right text-sm">
                      <div className="text-muted-foreground">Progresso: {student.progress}%</div>
                      <div className="text-muted-foreground">Média: {student.avgScore}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {student.quizzes} quizzes concluídos
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
