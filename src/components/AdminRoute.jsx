import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Spinner } from "./UI/primitives";
import AdminMfaGate from "./AdminMfaGate";

const AdminRoute = ({ children }) => {
  const { profile, isLoading, isAuthLoading, userId, navigate } = useApp();

  const isAdmin = profile?.role === "admin";
  const isResolvingAccess = isLoading || isAuthLoading;

  useEffect(() => {
    if (isResolvingAccess) return;

    if (!userId) {
      navigate("landing", { replace: true });
    } else if (!isAdmin) {
      navigate("dashboard", { replace: true });
    }
  }, [isAdmin, isResolvingAccess, navigate, userId]);

  if (isResolvingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Spinner size={36} />
      </div>
    );
  }

  if (!userId || !isAdmin) {
    return null;
  }

  return (
    <AdminMfaGate onOpenProfile={() => navigate("profile")}>
      {children}
    </AdminMfaGate>
  );
};

export default AdminRoute;
