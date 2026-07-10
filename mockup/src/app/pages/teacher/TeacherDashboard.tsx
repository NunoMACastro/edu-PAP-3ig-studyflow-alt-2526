import { Link } from "react-router";

export function TeacherDashboard() {
  const classes = [
    { id: 1, name: "12º IG", students: 25, subjects: 3 },
    { id: 2, name: "11º IG", students: 22, subjects: 2 },
  ];

  const subjects = [
    { id: 1, name: "Matemática", class: "12º IG", materials: 15 },
    { id: 2, name: "Programação", class: "12º IG", materials: 20 },
    { id: 3, name: "Bases de Dados", class: "11º IG", materials: 12 },
  ];

  const recentActivity = [
    { type: "material", text: "Novo material em Matemática - 12º IG", time: "Há 1 hora" },
    { type: "test", text: "Teste criado: Álgebra Linear", time: "Há 3 horas" },
    { type: "student", text: "João Silva concluiu Quiz de Funções", time: "Há 5 horas" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Dashboard do Professor</h1>
        <p className="text-muted-foreground mt-1">Visão geral das tuas turmas e disciplinas</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Turmas</div>
          <div className="text-3xl font-bold text-accent mt-1">{classes.length}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Disciplinas</div>
          <div className="text-3xl font-bold text-accent mt-1">{subjects.length}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Total Alunos</div>
          <div className="text-3xl font-bold text-accent mt-1">47</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Materiais</div>
          <div className="text-3xl font-bold text-accent mt-1">47</div>
        </div>
      </div>

      {/* Classes */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Minhas Turmas</h2>
          <Link to="/teacher/classes" className="text-sm text-accent hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              to={`/teacher/classes/${cls.id}`}
              className="border border-border rounded-lg p-4 hover:bg-muted"
            >
              <h3 className="font-bold text-primary text-lg">{cls.name}</h3>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{cls.students} alunos</span>
                <span>{cls.subjects} disciplinas</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Subjects & Activity */}
      <div className="grid grid-cols-2 gap-6">
        {/* Subjects */}
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Disciplinas</h2>
            <Link to="/teacher/subjects" className="text-sm text-accent hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/teacher/subjects/${subject.id}`}
                className="block border border-border rounded-lg p-3 hover:bg-muted"
              >
                <h3 className="font-medium text-primary">{subject.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {subject.class} • {subject.materials} materiais
                </p>
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

      {/* Quick Actions */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-4 gap-3">
          <Link
            to="/teacher/classes"
            className="px-4 py-3 text-center border border-border rounded-md hover:bg-muted text-sm"
          >
            + Nova Turma
          </Link>
          <Link
            to="/teacher/subjects"
            className="px-4 py-3 text-center border border-border rounded-md hover:bg-muted text-sm"
          >
            + Nova Disciplina
          </Link>
          <Link
            to="/teacher/tests"
            className="px-4 py-3 text-center border border-border rounded-md hover:bg-muted text-sm"
          >
            + Criar Teste
          </Link>
          <Link
            to="/teacher/projects"
            className="px-4 py-3 text-center border border-border rounded-md hover:bg-muted text-sm"
          >
            + Novo Projeto
          </Link>
        </div>
      </div>
    </div>
  );
}
