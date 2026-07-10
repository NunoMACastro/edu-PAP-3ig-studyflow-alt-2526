import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

// Auth pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Student pages
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudyAreas } from "./pages/student/StudyAreas";
import { StudyAreaDetail } from "./pages/student/StudyAreaDetail";
import { StudyRooms } from "./pages/student/StudyRooms";
import { StudyRoomDetail } from "./pages/student/StudyRoomDetail";
import { Profile } from "./pages/student/Profile";

// Teacher pages
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { Classes } from "./pages/teacher/Classes";
import { ClassDetail } from "./pages/teacher/ClassDetail";
import { Subjects } from "./pages/teacher/Subjects";
import { SubjectDetail } from "./pages/teacher/SubjectDetail";
import { Projects } from "./pages/teacher/Projects";
import { Tests } from "./pages/teacher/Tests";

// Admin pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Users } from "./pages/admin/Users";
import { Audit } from "./pages/admin/Audit";

// Shared pages
import { NotFound } from "./pages/NotFound";
import { Settings } from "./pages/Settings";
import { ColorTest } from "./pages/ColorTest";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        path: "auth",
        Component: AuthLayout,
        children: [
          { path: "login", Component: Login },
          { path: "register", Component: Register },
        ],
      },
      {
        path: "student",
        Component: DashboardLayout,
        children: [
          { index: true, Component: StudentDashboard },
          { path: "study-areas", Component: StudyAreas },
          { path: "study-areas/:id", Component: StudyAreaDetail },
          { path: "study-rooms", Component: StudyRooms },
          { path: "study-rooms/:id", Component: StudyRoomDetail },
          { path: "profile", Component: Profile },
        ],
      },
      {
        path: "teacher",
        Component: DashboardLayout,
        children: [
          { index: true, Component: TeacherDashboard },
          { path: "classes", Component: Classes },
          { path: "classes/:id", Component: ClassDetail },
          { path: "subjects", Component: Subjects },
          { path: "subjects/:id", Component: SubjectDetail },
          { path: "projects", Component: Projects },
          { path: "tests", Component: Tests },
        ],
      },
      {
        path: "admin",
        Component: DashboardLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "users", Component: Users },
          { path: "audit", Component: Audit },
        ],
      },
      { path: "settings", Component: Settings },
      { path: "color-test", Component: ColorTest },
      { path: "*", Component: NotFound },
    ],
  },
]);
