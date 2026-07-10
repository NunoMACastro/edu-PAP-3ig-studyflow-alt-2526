import { Link } from "react-router";

export function StudentDashboard() {
  const studyAreas = [
    { id: 1, name: "Matemática", materials: 12, progress: 65 },
    { id: 2, name: "Português", materials: 8, progress: 45 },
    { id: 3, name: "Física", materials: 15, progress: 80 },
  ];

  const studyRooms = [
    { id: 1, name: "Grupo de Matemática", members: 5 },
    { id: 2, name: "Preparação Exames", members: 8 },
  ];

  const recentActivity = [
    { type: "quiz", text: "Concluíste Quiz de Álgebra", time: "Há 2 horas" },
    { type: "material", text: "Novo material em Física", time: "Há 5 horas" },
    { type: "session", text: "Sessão de grupo agendada", time: "Há 1 dia" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Dashboard do Aluno</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo de volta!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Áreas de Estudo</div>
          <div className="text-3xl font-bold text-accent mt-1">{studyAreas.length}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Salas de Grupo</div>
          <div className="text-3xl font-bold text-accent mt-1">{studyRooms.length}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Progresso Médio</div>
          <div className="text-3xl font-bold text-accent mt-1">63%</div>
        </div>
      </div>

      {/* Study Areas */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Minhas Áreas de Estudo</h2>
          <Link
            to="/student/study-areas"
            className="text-sm text-accent hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        <div className="space-y-3">
          {studyAreas.map((area) => (
            <Link
              key={area.id}
              to={`/student/study-areas/${area.id}`}
              className="block border border-border rounded-lg p-4 hover:bg-muted"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-primary">{area.name}</h3>
                <span className="text-sm text-muted-foreground">{area.materials} materiais</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full"
                  style={{ width: `${area.progress}%` }}
                ></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Study Rooms & Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Study Rooms */}
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Salas de Grupo</h2>
            <Link
              to="/student/study-rooms"
              className="text-sm text-accent hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {studyRooms.map((room) => (
              <Link
                key={room.id}
                to={`/student/study-rooms/${room.id}`}
                className="block border border-border rounded-lg p-3 hover:bg-muted"
              >
                <h3 className="font-medium text-primary">{room.name}</h3>
                <p className="text-sm text-muted-foreground">{room.members} membros</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm text-primary">{activity.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
