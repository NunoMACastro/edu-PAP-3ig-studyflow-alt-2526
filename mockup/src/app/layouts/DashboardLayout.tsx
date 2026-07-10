import { Outlet, Link, useLocation } from "react-router";
import { useState } from "react";

export function DashboardLayout() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<"student" | "teacher" | "admin">("student");

  const isStudent = location.pathname.startsWith("/student");
  const isTeacher = location.pathname.startsWith("/teacher");
  const isAdmin = location.pathname.startsWith("/admin");

  const studentNav = [
    { to: "/student", label: "Dashboard" },
    { to: "/student/study-areas", label: "Áreas de Estudo" },
    { to: "/student/study-rooms", label: "Salas de Grupo" },
    { to: "/student/profile", label: "Perfil" },
  ];

  const teacherNav = [
    { to: "/teacher", label: "Dashboard" },
    { to: "/teacher/classes", label: "Turmas" },
    { to: "/teacher/subjects", label: "Disciplinas" },
    { to: "/teacher/projects", label: "Projetos" },
    { to: "/teacher/tests", label: "Testes" },
  ];

  const adminNav = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Utilizadores" },
    { to: "/admin/audit", label: "Auditoria" },
  ];

  let navigation = studentNav;
  if (isTeacher) navigation = teacherNav;
  if (isAdmin) navigation = adminNav;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-white">StudyFlow</h1>
              <nav className="flex gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2 rounded-md text-sm ${
                      location.pathname === item.to
                        ? "bg-accent text-white"
                        : "text-white/80 hover:bg-secondary"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {/* Role Switcher for wireframe */}
              <select
                value={isStudent ? "student" : isTeacher ? "teacher" : "admin"}
                onChange={(e) => {
                  const role = e.target.value as "student" | "teacher" | "admin";
                  window.location.href = `/${role}`;
                }}
                className="px-3 py-1 bg-secondary border border-border/20 text-white rounded-md text-sm"
              >
                <option value="student">Aluno</option>
                <option value="teacher">Professor</option>
                <option value="admin">Admin</option>
              </select>
              <Link
                to="/settings"
                className="px-3 py-2 text-sm text-white/80 hover:bg-secondary rounded-md"
              >
                Definições
              </Link>
              <Link
                to="/auth/login"
                className="px-3 py-2 text-sm text-white/80 hover:bg-secondary rounded-md"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
