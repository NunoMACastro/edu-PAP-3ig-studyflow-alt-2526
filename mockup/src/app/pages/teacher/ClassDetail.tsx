import { useParams, Link } from "react-router";

export function ClassDetail() {
  const { id } = useParams();

  const classData = {
    id,
    name: "12º IG",
    year: "12º",
    course: "Informática de Gestão",
    students: 25,
  };

  const students = [
    { id: 1, name: "Ana Pereira", progress: 85, lastActive: "Há 2 horas" },
    { id: 2, name: "João Silva", progress: 72, lastActive: "Há 5 horas" },
    { id: 3, name: "Maria Santos", progress: 90, lastActive: "Há 1 dia" },
    { id: 4, name: "Pedro Costa", progress: 65, lastActive: "Há 2 dias" },
    { id: 5, name: "Rui Oliveira", progress: 78, lastActive: "Há 3 horas" },
  ];

  const subjects = [
    { id: 1, name: "Matemática", materials: 15 },
    { id: 2, name: "Programação", materials: 20 },
    { id: 3, name: "Bases de Dados", materials: 12 },
  ];

  const announcements = [
    { id: 1, title: "Teste de Matemática - 25/04", date: "20/04/2026" },
    { id: 2, title: "Novo material disponível", date: "19/04/2026" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/teacher/classes" className="text-sm text-accent hover:underline mb-2 block">
          ← Voltar às Turmas
        </Link>
        <h1 className="text-3xl font-bold text-primary">{classData.name}</h1>
        <p className="text-muted-foreground mt-1">
          {classData.course} • {classData.students} alunos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Total Alunos</div>
          <div className="text-3xl font-bold text-primary mt-1">{classData.students}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Disciplinas</div>
          <div className="text-3xl font-bold text-primary mt-1">{subjects.length}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Progresso Médio</div>
          <div className="text-3xl font-bold text-primary mt-1">78%</div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Disciplinas</h2>
          <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
            + Associar Disciplina
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/teacher/subjects/${subject.id}`}
              className="border border-border rounded-lg p-4 hover:bg-muted"
            >
              <h3 className="font-medium text-primary">{subject.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{subject.materials} materiais</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Students & Announcements */}
      <div className="grid grid-cols-2 gap-6">
        {/* Students */}
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Alunos</h2>
            <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
              + Adicionar
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {students.map((student) => (
              <div
                key={student.id}
                className="border border-border rounded-lg p-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-primary">{student.name}</h3>
                  <span className="text-sm text-muted-foreground">{student.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div
                    className="bg-accent h-2 rounded-full"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">Última atividade: {student.lastActive}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Avisos</h2>
            <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-muted">
              + Novo Aviso
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border border-border rounded-lg p-3"
              >
                <h3 className="font-medium text-primary">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{announcement.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
