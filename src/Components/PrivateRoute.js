import React from "react";
import { useAuth } from "../AuthContext";
import { Navigate, useLocation, Outlet } from "react-router-dom";

function PrivateRoute() {
  const { user } = useAuth();
  const location = useLocation();

  return user ? (
    <Outlet />
  ) : (
    <Navigate to={"/"} state={{ from: location }} replace />
  );
}

export default PrivateRoute;
