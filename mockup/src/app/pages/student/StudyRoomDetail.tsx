import { useParams, Link } from "react-router";
import { useState } from "react";

export function StudyRoomDetail() {
  const { id } = useParams();
  const [message, setMessage] = useState("");

  const room = {
    id,
    name: "Grupo de Matemática",
    subject: "Matemática",
    members: 5,
  };

  const members = [
    { id: 1, name: "João Silva", status: "online" },
    { id: 2, name: "Maria Santos", status: "online" },
    { id: 3, name: "Pedro Costa", status: "offline" },
    { id: 4, name: "Ana Pereira", status: "online" },
    { id: 5, name: "Rui Oliveira", status: "offline" },
  ];

  const messages = [
    { id: 1, user: "João Silva", text: "Alguém pode ajudar com o exercício 5?", time: "14:30" },
    { id: 2, user: "Maria Santos", text: "Sim, qual é a tua dúvida?", time: "14:32" },
    { id: 3, user: "João Silva", text: "Não percebo como resolver...", time: "14:33" },
  ];

  const sharedMaterials = [
    { id: 1, name: "Resumo - Funções.pdf", uploadedBy: "Maria Santos" },
    { id: 2, name: "Exercícios Resolvidos.docx", uploadedBy: "Pedro Costa" },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/student/study-rooms" className="text-sm text-accent hover:underline mb-2 block">
          ← Voltar às Salas de Grupo
        </Link>
        <h1 className="text-3xl font-bold text-primary">{room.name}</h1>
        <p className="text-muted-foreground mt-1">{room.subject} • {room.members} membros</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chat & Shared Materials */}
        <div className="col-span-2 space-y-6">
          {/* Group Chat */}
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Chat do Grupo</h2>
            <div className="border border-border rounded-lg p-4 h-80 overflow-y-auto bg-muted mb-3">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="border-b border-border pb-2">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-primary text-sm">{msg.user}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreve uma mensagem..."
                className="flex-1 px-3 py-2 border border-border rounded-md"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
              >
                Enviar
              </button>
            </form>
          </div>

          {/* Shared Materials */}
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-primary">Materiais Partilhados</h2>
              <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
                + Partilhar
              </button>
            </div>
            <div className="space-y-2">
              {sharedMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex justify-between items-center border border-border rounded-lg p-3"
                >
                  <div>
                    <h3 className="text-sm font-medium text-primary">{material.name}</h3>
                    <p className="text-xs text-muted-foreground">Por {material.uploadedBy}</p>
                  </div>
                  <button className="text-sm text-accent hover:underline">Ver</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Members & AI */}
        <div className="space-y-6">
          {/* Members */}
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Membros ({members.length})</h2>
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      member.status === "online" ? "bg-accent" : "bg-muted-foreground"
                    }`}
                  ></div>
                  <span className="text-sm text-primary">{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Group AI Assistant */}
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Assistente IA do Grupo</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Faz perguntas sobre os materiais partilhados do grupo
            </p>
            <button className="w-full px-3 py-2 bg-accent text-white rounded-md hover:opacity-90 text-sm">
              Falar com IA
            </button>
          </div>

          {/* Schedule Session */}
          <div className="bg-card border-2 border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-primary mb-4">Agendar Sessão</h2>
            <button className="w-full px-3 py-2 border border-border rounded-md hover:bg-muted text-sm">
              + Nova Sessão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
