import { Navigate, useRoutes } from "react-router-dom";

// Pages
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import EditProfile from "./components/user/EditProfile";
import LogIn from "./components/auth/LogIn";
import SignUp from "./components/auth/SignUp";
import RepositoryDetails from "./components/repo/RepositoryDetails";
import StarredRepos from "./components/repo/StarredRepos";
import CreateRepository from "./components/repo/CreateRepository";
import NotFound from "./components/common/NotFound";
import RequireAuth from "./components/common/RequireAuth";
import Landing from "./components/landing/Landing";
// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currUser, loading } = useAuth();
  const isLoggedIn = Boolean(localStorage.getItem("token")); // use the key authContext.jsx stores the JWT under

  const routes = useRoutes([
    {
      path: "/",
      element: isLoggedIn ? <Navigate to="/dashboard" replace /> : <Landing />,
    },
    {
      path: "/dashboard",
      element: (
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      ),
    },
    {
      path: "/auth",
      element: currUser ? <Navigate to="/" replace /> : <LogIn />,
    },
    {
      path: "/signup",
      element: currUser ? <Navigate to="/" replace /> : <SignUp />,
    },
    {
      path: "/create-new-repo",
      element: (
        <RequireAuth>
          <CreateRepository />
        </RequireAuth>
      ),
    },
    {
      path: "/profile",
      element: (
        <RequireAuth>
          <Profile />
        </RequireAuth>
      ),
    },
    {
      path: "/edit-profile",
      element: (
        <RequireAuth>
          <EditProfile />
        </RequireAuth>
      ),
    },
    {
      path: "/starredRepo",
      element: (
        <RequireAuth>
          <StarredRepos />
        </RequireAuth>
      ),
    },
    {
      path: "/repositories/:repoId",
      element: (
        <RequireAuth>
          <RepositoryDetails />
        </RequireAuth>
      ),
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  if (loading) {
    return <div role="status">Loading GitVerse...</div>;
  }

  return routes;
};

export default ProjectRoutes;
