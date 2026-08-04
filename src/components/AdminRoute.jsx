import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Spinner } from "./UI/primitives";
import AdminMfaGate from "./AdminMfaGate";

const AdminRoute = ({ children }) => {
  const { profile, isLoading, navigate } = useApp();

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    // O perfil e carregado de forma assíncrona no bootstrap. Redirecionar
    // enquanto `isLoading` ainda é true expulsava administradores legítimos
    // de /admin antes de a role chegar do Supabase.
    if (!isLoading && !isAdmin) {
      navigate("dashboard", { replace: true });
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Spinner size={36} />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminMfaGate onOpenProfile={() => navigate("profile")}>
      {children}
    </AdminMfaGate>
  );
};

export default AdminRoute;
