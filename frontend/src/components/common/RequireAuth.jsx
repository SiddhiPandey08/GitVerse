import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../authContext";

export default function RequireAuth({ children }) {
  const { currUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div role="status">Loading GitVerse...</div>;
  }

  if (!currUser) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
