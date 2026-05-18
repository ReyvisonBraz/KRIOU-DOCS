import React from "react";
import { useApp } from "../context/AppContext";

const AdminRoute = ({ children }) => {
  const { profile, navigate } = useApp();

  if (!profile || profile.role !== "admin") {
    navigate("dashboard", { replace: true });
    return null;
  }

  return children;
};

export default AdminRoute;
