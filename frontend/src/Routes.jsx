import React from "react";
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

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  const routes = useRoutes([
    {
      path: "/",
      element: currUser ? <Dashboard /> : <Navigate to="/auth" replace />,
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
      path: "/createRepo",
      element: currUser ? (
        <CreateRepository />
      ) : (
        <Navigate to="/auth" replace />
      ),
    },
    {
      path: "/profile",
      element: currUser ? <Profile /> : <Navigate to="/auth" replace />,
    },
    {
      path: "/edit-profile",
      element: <EditProfile />,
    },
    {
      path: "/starredRepo",
      element: currUser ? <StarredRepos /> : <Navigate to="/auth" replace />,
    },
    {
      path: "/repositories/:repoId",
      element: currUser ? (
        <RepositoryDetails />
      ) : (
        <Navigate to="/auth" replace />
      ),
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return routes;
};

export default ProjectRoutes;
