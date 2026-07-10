import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";

export function RootLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect root to login for wireframe
    if (window.location.pathname === "/") {
      navigate("/auth/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
