// RepositoryDetails.jsx — main repository view featuring Code, Issues, Chat, and Collaborators tabs.
// Talks to: api/repositories.js, RepoFiles.jsx, CommitHistory.jsx, RepoChat.jsx, RepoIssues.jsx, RepoCollaborators.jsx.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteRepository, toggleStar, toggleVisibility } from "../../api/repositories";
import Navbar from "../navbar/Navbar";
import CommitHistory from "./CommitHistory";
import RepoFiles from "./RepoFiles";
import RepoReadme from "./RepoReadme";
import RepoChat from "./RepoChat";
import RepoIssues from "../issue/RepoIssues";
import RepoCollaborators from "./RepoCollaborators";
import { VideoCamera } from "@phosphor-icons/react";
import client from "../../api/client";
import { Box, Typography, Chip, Button, Snackbar } from "@mui/material";
import { VisibilityIcon, DeleteIcon, StarIcon, StarBorderIcon } from "../common/icons";
import useRepository from "../../hooks/useRepository";
import useCommits from "../../hooks/useCommits";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";

export default function RepositoryDetails() {
  const { repoId, id } = useParams();
  const activeId = repoId || id;
  const navigate = useNavigate();

  const { data: repo, loading, error, reload } = useRepository(activeId);
  const commitsState = useCommits(activeId);
  const [repoOverride, setRepoOverride] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [starring, setStarring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [repoTab, setRepoTab] = useState("code"); // "code" | "issues" | "chat" | "collaborators"
  
  const displayedRepo = repoOverride || repo;
  const currentUserId = localStorage.getItem("userId");
  const isOwner =
    displayedRepo?.role === "owner" ||
    String(displayedRepo?.owner?._id || displayedRepo?.owner) === currentUserId;

  useEffect(() => {
    setIsStarred(Boolean(repo?.isStarred || repo?.starred));
  }, [repo]);

  // Toggle repository public / private visibility (owner only).
  const handleToggleVisibility = async () => {
    if (!repo || !activeId) return;

    setToggling(true);
    try {
      const response = await toggleVisibility(activeId);

      if (response.data && response.data.updatedRepo) {
        setRepoOverride(response.data.updatedRepo);
      } else if (response.data) {
        setRepoOverride(response.data);
      }
      setNotice("Repository visibility updated.");
    } catch (err) {
      console.error("Error toggling visibility:", err.response?.data || err.message);
    } finally {
      setToggling(false);
    }
  };

  // Toggle star / unstar for current user.
  const handleStarToggle = async () => {
    if (!activeId || starring) return;

    setStarring(true);
    const previousState = isStarred;
    setIsStarred(!previousState);

    try {
      const response = await toggleStar(activeId);

      if (response.data && response.data.updatedRepo) {
        setRepoOverride(response.data.updatedRepo);
        setIsStarred(
          Boolean(
            response.data.updatedRepo.isStarred || response.data.updatedRepo.starred,
          ),
        );
        setNotice(
          response.data.updatedRepo.isStarred
            ? "Repository starred."
            : "Repository unstarred.",
        );
      }
    } catch (err) {
      console.error("Error toggling star status:", err.response?.data || err.message);
      setIsStarred(previousState);
    } finally {
      setStarring(false);
    }
  };

  // Navigates into the WebRTC video meeting room.
  const handleStartCall = () => {
    client
      .post("/meetings/history", { meeting_code: `repo-${activeId}` })
      .catch(() => {});
    navigate(`/meet/repo-${activeId}`);
  };

  // Deletes repository (owner only).
  const handleDeleteRepo = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${displayedRepo?.name}"? This action cannot be undone.`,
    );
    if (!confirmDelete || !activeId) return;

    setDeleting(true);
    try {
      await deleteRepository(activeId);
      navigate("/dashboard", {
        state: { message: "Repository deleted successfully." },
      });
    } catch (err) {
      console.error("Error deleting repository:", err);
      setActionError(err.response?.data?.message || "Failed to delete repository.");
    } finally {
      setDeleting(false);
    }
  };

  const isPublic = displayedRepo?.visibility === true;

  const getVisibilityLabel = () => {
    return isPublic ? "Public" : "Private";
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#0d1117",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingState message="Loading repository..." />
      </Box>
    );
  }

  if (error || !repo) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#f0f6fc" }}>
        <Navbar />
        <Box sx={{ maxWidth: 760, mx: "auto", px: 3, py: 8 }}>
          <ErrorState message={error || "Repository not found."} onRetry={reload} />
        </Box>
      </Box>
    );
  }

  const tabs = [
    { id: "code", label: "📁 Code" },
    { id: "issues", label: "⚠️ Issues" },
    { id: "chat", label: "💬 Chat" },
    { id: "collaborators", label: "👥 Collaborators" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#f0f6fc" }}>
      <Navbar />

      <Box sx={{ maxWidth: "1280px", mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography
              variant="h6"
              sx={{
                color: "#58a6ff",
                fontWeight: 500,
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              {displayedRepo?.owner?.username || "Owner"} /{" "}
              <span style={{ fontWeight: 700 }}>
                {displayedRepo?.name || "Repository"}
              </span>
            </Typography>

            <Chip
              label={getVisibilityLabel()}
              size="small"
              sx={{
                height: "22px",
                fontSize: "12px",
                fontWeight: 500,
                color: isPublic ? "#8b949e" : "#e3b341",
                backgroundColor: "transparent",
                border: `1px solid ${isPublic ? "#30363d" : "#e3b341"}`,
                borderRadius: "12px",
              }}
            />

            {displayedRepo?.role && (
              <Chip
                label={displayedRepo.role}
                size="small"
                sx={{
                  height: "22px",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  color:
                    displayedRepo.role === "owner"
                      ? "#3fb950"
                      : displayedRepo.role === "collaborator"
                      ? "#58a6ff"
                      : "#8b949e",
                  backgroundColor: "rgba(48, 54, 61, 0.4)",
                  border: "1px solid #30363d",
                  borderRadius: "12px",
                }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleStartCall}
              startIcon={<VideoCamera size={16} />}
              sx={{
                color: "#c9d1d9",
                borderColor: "#30363d",
                textTransform: "none",
                backgroundColor: "#21262d",
                "&:hover": { backgroundColor: "#30363d" },
              }}
            >
              Start call
            </Button>

            <Button
              variant="outlined"
              size="small"
              disabled={starring}
              onClick={handleStarToggle}
              startIcon={
                isStarred ? <StarIcon sx={{ color: "#e3b341" }} /> : <StarBorderIcon />
              }
              sx={{
                color: isStarred ? "#e3b341" : "#c9d1d9",
                borderColor: "#30363d",
                textTransform: "none",
                backgroundColor: "#21262d",
                "&:hover": { backgroundColor: "#30363d" },
              }}
            >
              {isStarred ? "Starred" : "Star"}
            </Button>
          </Box>
        </Box>

        {/* Repository Content Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 300px" },
            gap: 3,
          }}
        >
          <Box>
            {/* Control Bar (Owner operations) */}
            {isOwner && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "stretch", sm: "flex-end" },
                  flexWrap: "wrap",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  disabled={toggling}
                  onClick={handleToggleVisibility}
                  startIcon={<VisibilityIcon />}
                  sx={{
                    color: "#c9d1d9",
                    borderColor: "#30363d",
                    textTransform: "none",
                    backgroundColor: "#21262d",
                    "&:hover": { backgroundColor: "#30363d" },
                  }}
                >
                  {toggling ? "Updating..." : "Toggle Visibility"}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  disabled={deleting}
                  onClick={handleDeleteRepo}
                  startIcon={<DeleteIcon />}
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#21262d",
                    "&:hover": { backgroundColor: "rgba(248,81,73,0.1)" },
                  }}
                >
                  {deleting ? "Deleting..." : "Delete Repo"}
                </Button>
              </Box>
            )}

            <Snackbar
              open={Boolean(notice)}
              autoHideDuration={4000}
              onClose={() => setNotice("")}
              message={notice}
            />
            {actionError && <ErrorState message={actionError} />}

            {/* Navigation Tabs */}
            <Box
              sx={{
                display: "flex",
                borderBottom: "1px solid #30363d",
                mb: 2.5,
                gap: 1,
                overflowX: "auto",
              }}
            >
              {tabs.map((tab) => (
                <Box
                  key={tab.id}
                  onClick={() => setRepoTab(tab.id)}
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: repoTab === tab.id ? "#f0f6fc" : "#8b949e",
                    borderBottom: repoTab === tab.id ? "2px solid #f78166" : "2px solid transparent",
                    mb: "-1px",
                    transition: "color 0.15s, border-color 0.15s",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    "&:hover": { color: "#f0f6fc" },
                  }}
                >
                  {tab.label}
                </Box>
              ))}
            </Box>

            {/* Tab: Code */}
            {repoTab === "code" && (
              <>
                <RepoFiles repoId={activeId} commitsState={commitsState} />
                <CommitHistory
                  repoId={activeId}
                  commitsState={commitsState}
                  isOwner={isOwner}
                />
                <RepoReadme
                  repoId={activeId}
                  name={displayedRepo?.name}
                  description={displayedRepo?.description}
                  commitsState={commitsState}
                />
              </>
            )}

            {/* Tab: Issues */}
            {repoTab === "issues" && (
              <RepoIssues
                repoId={activeId}
                isOwner={isOwner}
                currentUserId={currentUserId}
              />
            )}

            {/* Tab: Chat */}
            {repoTab === "chat" && (
              <RepoChat repoId={activeId} isOwner={isOwner} />
            )}

            {/* Tab: Collaborators */}
            {repoTab === "collaborators" && (
              <RepoCollaborators repoId={activeId} isOwner={isOwner} />
            )}
          </Box>

          {/* Sidebar */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 1 }}>
              About
            </Typography>
            <Typography sx={{ color: "#8b949e", fontSize: "14px" }}>
              {displayedRepo?.description || "No description provided."}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
