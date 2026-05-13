import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import { isTokenExpired } from "../../features/auth/tokenUtils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const tokenExpired = isAuthenticated && isTokenExpired(token);

  useEffect(() => {
    if (tokenExpired) {
      dispatch(logout());
    }
  }, [dispatch, tokenExpired]);

  if (tokenExpired) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
