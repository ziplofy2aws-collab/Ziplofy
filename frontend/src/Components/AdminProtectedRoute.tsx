import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/admin-auth.context";

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAdminAuth();
  if (!token || !user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export default AdminProtectedRoute;


