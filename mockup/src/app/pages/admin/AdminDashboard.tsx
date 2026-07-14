import { Link } from "react-router";

export function AdminDashboard() {
  const stats = {
    totalUsers: 152,
    students: 120,
    teachers: 30,
    admins: 2,
    totalClasses: 12,
    totalSubjects: 24,
    totalMaterials: 450,
  };

  const recentActivity = [
    { type: "user", text: "Novo utilizador registado: João Silva", time: "Há 1 hora" },
    { type: "material", text: "Material enviado: Matemática - Cap 5", time: "Há 2 horas" },
    { type: "class", text: "Nova turma criada: 10º IG", time: "Há 5 horas" },
    { type: "ai", text: "Quota IA atingida: Turma 12º IG", time: "Há 1 dia" },
  ];

  const systemHealth = [
    { service: "API Backend", status: "online", uptime: "99.9%" },
    { service: "Base de Dados", status: "online", uptime: "100%" },
    { service: "Serviço IA", status: "online", uptime: "98.5%" },
    { service: "Storage", status: "online", uptime: "100%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-accent">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Total Utilizadores</div>
          <div className="text-3xl font-bold text-accent mt-1">{stats.totalUsers}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Alunos</div>
          <div className="text-3xl font-bold text-accent mt-1">{stats.students}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Professores</div>
          <div className="text-3xl font-bold text-accent mt-1">{stats.teachers}</div>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="text-sm text-muted-foreground">Turmas</div>
          <div className="text-3xl font-bold text-accent mt-1">{stats.totalClasses}</div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Estado do Sistema</h2>
        <div className="space-y-3">
          {systemHealth.map((service, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border border-border rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="font-medium text-primary">{service.service}</span>
              </div>
              <div className="text-sm text-muted-foreground">Uptime: {service.uptime}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Atividade Recente</h2>
            <Link to="/admin/audit" className="text-sm text-accent hover:underline">
              Ver auditoria →
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm text-primary">{activity.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border-2 border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Ações Rápidas</h2>
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="block px-4 py-3 text-center border border-border rounded-md hover:bg-muted"
            >
              Gerir Utilizadores
            </Link>
            <button className="w-full px-4 py-3 text-center border border-border rounded-md hover:bg-muted">
              Configurar Quotas IA
            </button>
            <button className="w-full px-4 py-3 text-center border border-border rounded-md hover:bg-muted">
              Ver Logs do Sistema
            </button>
            <Link
              to="/admin/audit"
              className="block px-4 py-3 text-center border border-border rounded-md hover:bg-muted"
            >
              Auditoria Completa
            </Link>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-card border-2 border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Uso de Recursos</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Storage</span>
              <span className="text-primary font-medium">45 GB / 100 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Quota IA (mensal)</span>
              <span className="text-primary font-medium">12.5k / 20k</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: "62.5%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Utilizadores Ativos</span>
              <span className="text-primary font-medium">89 / 200</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: "44.5%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
