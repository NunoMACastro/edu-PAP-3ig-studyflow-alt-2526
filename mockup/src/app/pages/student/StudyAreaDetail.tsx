import { useParams, Link } from "react-router";
import { useState } from "react";

export function StudyAreaDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"materials" | "summaries" | "quizzes">("materials");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const area = {
    id,
    name: "Matemática",
    progress: 65,
  };

  const materials = [
    { id: 1, name: "Álgebra - Capítulo 3.pdf", type: "PDF", uploadedAt: "20/04/2026" },
    { id: 2, name: "Exercícios Resolvidos.docx", type: "DOCX", uploadedAt: "18/04/2026" },
    { id: 3, name: "Vídeo-aula: Funções", type: "URL", uploadedAt: "15/04/2026" },
  ];

  const summaries = [
    { id: 1, title: "Resumo: Funções Quadráticas", generatedAt: "19/04/2026" },
    { id: 2, title: "Resumo: Equações do 2º Grau", generatedAt: "17/04/2026" },
  ];

  const quizzes = [
    { id: 1, title: "Quiz: Álgebra Básica", score: 85, completedAt: "20/04/2026" },
    { id: 2, title: "Quiz: Funções", score: 92, completedAt: "18/04/2026" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/student/study-areas" className="text-sm text-accent hover:underline mb-2 block">
            ← Voltar às Áreas de Estudo
          </Link>
          <h1 className="text-3xl font-bold text-primary">{area.name}</h1>
          <p className="text-muted-foreground mt-1">Progresso: {area.progress}%</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Adicionar Material
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-accent h-3 rounded-full"
            style={{ width: `${area.progress}%` }}
          ></div>
        </div>
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
            onClick={() => setActiveTab("summaries")}
            className={`px-4 py-2 border-b-2 ${
              activeTab === "summaries"
                ? "border-accent text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            Resumos IA
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-2 border-b-2 ${
              activeTab === "quizzes"
                ? "border-accent text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            Quizzes
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        {activeTab === "materials" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-primary mb-4">Materiais de Estudo</h2>
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex justify-between items-center border border-border rounded-lg p-4"
              >
                <div>
                  <h3 className="font-medium text-primary">{material.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {material.type} • Enviado em {material.uploadedAt}
                  </p>
                </div>
                <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
                  Ver
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "summaries" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-primary">Resumos Gerados pela IA</h2>
              <button className="px-3 py-1 text-sm bg-accent text-white rounded-md hover:opacity-90">
                + Gerar Resumo
              </button>
            </div>
            {summaries.map((summary) => (
              <div
                key={summary.id}
                className="border border-border rounded-lg p-4"
              >
                <h3 className="font-medium text-primary">{summary.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Gerado em {summary.generatedAt}</p>
                <button className="mt-2 text-sm text-accent hover:underline">
                  Ler resumo →
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-primary">Quizzes</h2>
              <button className="px-3 py-1 text-sm bg-accent text-white rounded-md hover:opacity-90">
                + Criar Quiz
              </button>
            </div>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex justify-between items-center border border-border rounded-lg p-4"
              >
                <div>
                  <h3 className="font-medium text-primary">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Concluído em {quiz.completedAt}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{quiz.score}%</div>
                  <button className="text-sm text-accent hover:underline mt-1">
                    Rever →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat with AI Assistant */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-primary mb-4">Assistente IA Privado</h2>
        <div className="border border-border rounded-lg p-4 min-h-[200px] bg-muted mb-3">
          <p className="text-sm text-muted-foreground italic">
            Faz perguntas sobre os teus materiais de estudo...
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escreve a tua pergunta..."
            className="flex-1 px-3 py-2 border border-border rounded-md"
          />
          <button className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90">
            Enviar
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Adicionar Material</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo de Material
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="file">Ficheiro (PDF/DOCX)</option>
                  <option value="url">URL/Link</option>
                  <option value="text">Texto/Notas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Carregar Ficheiro
                </label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
