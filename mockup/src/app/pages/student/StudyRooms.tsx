import { Link } from "react-router";
import { useState } from "react";

export function StudyRooms() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState("");

  const myRooms = [
    {
      id: 1,
      name: "Grupo de Matemática",
      members: 5,
      subject: "Matemática",
      nextSession: "22/04/2026 15:00",
    },
    {
      id: 2,
      name: "Preparação Exames",
      members: 8,
      subject: "Geral",
      nextSession: "23/04/2026 10:00",
    },
  ];

  const availableRooms = [
    { id: 3, name: "Física - Mecânica", members: 4, subject: "Física" },
    { id: 4, name: "História - Séc. XX", members: 6, subject: "História" },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    setRoomName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Salas de Estudo em Grupo</h1>
          <p className="text-muted-foreground mt-1">Colabora com outros alunos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90"
        >
          + Criar Sala
        </button>
      </div>

      {/* My Rooms */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Minhas Salas</h2>
        <div className="space-y-3">
          {myRooms.map((room) => (
            <Link
              key={room.id}
              to={`/student/study-rooms/${room.id}`}
              className="block border border-border rounded-lg p-4 hover:bg-muted"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-primary">{room.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {room.subject} • {room.members} membros
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Próxima sessão: {room.nextSession}
                  </p>
                </div>
                <span className="text-sm text-accent hover:underline">Abrir →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Available Rooms */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Salas Disponíveis</h2>
        <div className="space-y-3">
          {availableRooms.map((room) => (
            <div
              key={room.id}
              className="flex justify-between items-center border border-border rounded-lg p-4"
            >
              <div>
                <h3 className="font-medium text-primary">{room.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {room.subject} • {room.members} membros
                </p>
              </div>
              <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
                Entrar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">Criar Nova Sala de Estudo</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nome da Sala
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: Preparação Exames"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Disciplina (opcional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="ex: Matemática"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Privacidade
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="public">Pública - Qualquer aluno pode entrar</option>
                  <option value="private">Privada - Apenas por convite</option>
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
