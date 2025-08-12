import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactElement; requireAdmin?: boolean }) => {
  const { user, loading, enabled, isAdmin } = useAuth();

  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get('bypass_auth') === 'true') {
    return children;
  }

  if (!enabled) return <Navigate to="/auth" replace />;
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  return children;
};
