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
import Landing from "./components/landing/Landing";
// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
  const { currUser, loading } = useAuth();
  const isLoggedIn = Boolean(localStorage.getItem("token")); // use the key authContext.jsx stores the JWT under

  if (loading) {
    return null;
  }

  const routes = useRoutes([
    {
      path: "/",
      element: isLoggedIn ? <Navigate to="/dashboard" replace /> : <Landing />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
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
