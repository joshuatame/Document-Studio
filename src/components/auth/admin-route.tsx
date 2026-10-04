import { Navigate, Outlet } from "react-router-dom";
import { isAdminUser, isAuthenticated } from "@/lib/auth";

export function AdminRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
