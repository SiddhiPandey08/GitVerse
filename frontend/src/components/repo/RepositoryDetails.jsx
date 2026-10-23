import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteRepository, toggleStar, toggleVisibility } from "../../api/repositories";
import Navbar from "../navbar/Navbar";
import CommitHistory from "./CommitHistory";
import RepoFiles from "./RepoFiles";
import RepoReadme from "./RepoReadme";
import RepoChat from "./RepoChat";
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
  const [repoTab, setRepoTab] = useState("code"); // "code" | "chat"
  const displayedRepo = repoOverride || repo;
  const isOwner =
    String(displayedRepo?.owner?._id || displayedRepo?.owner) ===
    localStorage.getItem("userId");

  useEffect(() => {
    setIsStarred(Boolean(repo?.isStarred || repo?.starred));
  }, [repo]);

  // 2. Toggle Visibility Handler
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

  // 3. Updated Star / Unstar Handler
  const handleStarToggle = async () => {
    if (!activeId || starring) return;

    setStarring(true);
    // Optimistic UI update
    const previousState = isStarred;
    setIsStarred(!previousState);

    try {
      // Calls PATCH endpoint matching toggle-visibility route pattern
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
      setIsStarred(previousState); // Revert state if backend request fails
    } finally {
      setStarring(false);
    }
  };
  const handleStartCall = () => {
    client
      .post("/meetings/history", { meeting_code: `repo-${activeId}` })
      .catch(() => {});
    navigate(`/meet/repo-${activeId}`);
  };

  // 4. Delete Repository Handler
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
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
          </Box>
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
          <Box sx={{ display: "flex", gap: 1 }}>
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
            {/* Control Bar */}
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
            <Snackbar
              open={Boolean(notice)}
              autoHideDuration={4000}
              onClose={() => setNotice("")}
              message={notice}
            />
            {actionError && <ErrorState message={actionError} />}

            {/* Code | Chat tab switch */}
            <Box
              sx={{
                display: "flex",
                borderBottom: "1px solid #30363d",
                mb: 2,
              }}
            >
              {["code", "chat"].map((tab) => (
                <Box
                  key={tab}
                  onClick={() => setRepoTab(tab)}
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: "13px",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    cursor: "pointer",
                    color: repoTab === tab ? "#f0f6fc" : "#8b949e",
                    borderBottom: repoTab === tab ? "2px solid #f78166" : "2px solid transparent",
                    mb: "-1px",
                    transition: "color 0.15s, border-color 0.15s",
                    userSelect: "none",
                    "&:hover": { color: "#f0f6fc" },
                  }}
                >
                  {tab === "code" ? "\u{1F4C1} Code" : "\u{1F4AC} Chat"}
                </Box>
              ))}
            </Box>

            {repoTab === "code" && (
              <>
                <RepoFiles repoId={activeId} commitsState={commitsState} />
                <CommitHistory repoId={activeId} commitsState={commitsState} />
                <RepoReadme
                  repoId={activeId}
                  name={displayedRepo?.name}
                  description={displayedRepo?.description}
                  commitsState={commitsState}
                />
              </>
            )}

            {repoTab === "chat" && (
              <RepoChat repoId={activeId} isOwner={isOwner} />
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
