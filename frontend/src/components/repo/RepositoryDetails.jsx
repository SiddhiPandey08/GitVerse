import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export default function RepositoryDetails() {
  const { repoId, id } = useParams();
  const activeId = repoId || id;
  const navigate = useNavigate();

  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [starring, setStarring] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch Repository Details
  useEffect(() => {
    const fetchRepo = async () => {
      if (!activeId) return;
      try {
        const response = await axios.get(
          `http://localhost:3000/repositories/${activeId}`,
        );
        setRepo(response.data);
        // Sync initial starred status from backend repo data
        setIsStarred(
          Boolean(response.data?.isStarred || response.data?.starred),
        );
      } catch (err) {
        console.error("Error fetching repository:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [activeId]);

  // 2. Toggle Visibility Handler
  const handleToggleVisibility = async () => {
    if (!repo || !activeId) return;

    setToggling(true);
    try {
      const response = await axios.patch(
        `http://localhost:3000/repositories/toggle-visibility/${activeId}`,
      );

      if (response.data && response.data.updatedRepo) {
        setRepo(response.data.updatedRepo);
      } else if (response.data) {
        setRepo(response.data);
      }
    } catch (err) {
      console.error(
        "Error toggling visibility:",
        err.response?.data || err.message,
      );
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
      const response = await axios.patch(
        `http://localhost:3000/repositories/toggle-star/${activeId}`,
      );

      if (response.data && response.data.updatedRepo) {
        setRepo(response.data.updatedRepo);
        setIsStarred(
          Boolean(
            response.data.updatedRepo.isStarred ||
            response.data.updatedRepo.starred,
          ),
        );
      }
    } catch (err) {
      console.error(
        "Error toggling star status:",
        err.response?.data || err.message,
      );
      setIsStarred(previousState); // Revert state if backend request fails
    } finally {
      setStarring(false);
    }
  };

  // 4. Delete Repository Handler
  const handleDeleteRepo = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${repo?.name}"? This action cannot be undone.`,
    );
    if (!confirmDelete || !activeId) return;

    setDeleting(true);
    try {
      await axios.delete(
        `http://localhost:3000/repositories/delete/${activeId}`,
      );
      navigate("/");
    } catch (err) {
      console.error("Error deleting repository:", err);
      alert(err.response?.data?.message || "Failed to delete repository.");
    } finally {
      setDeleting(false);
    }
  };

  const isPublic =
    typeof repo?.visibility === "boolean"
      ? repo.visibility
      : repo?.visibility === "Private";

  const getVisibilityLabel = () => {
    if (typeof repo?.visibility === "boolean") {
      return repo.visibility ? "Public" : "Private";
    }
    return repo?.visibility || "Public";
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
        <CircularProgress sx={{ color: "#58a6ff" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#f0f6fc" }}
    >
      <Navbar />

      <Box sx={{ maxWidth: "1280px", mx: "auto", px: 3, py: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h6" sx={{ color: "#58a6ff", fontWeight: 500 }}>
              {repo?.owner?.username || "Owner"} /{" "}
              <span style={{ fontWeight: 700 }}>
                {repo?.name || "Repository"}
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

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={starring}
              onClick={handleStarToggle}
              startIcon={
                isStarred ? (
                  <StarIcon sx={{ color: "#e3b341" }} />
                ) : (
                  <StarBorderIcon />
                )
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
            <Button
              variant="outlined"
              size="small"
              startIcon={<CallSplitIcon />}
              sx={{
                color: "#c9d1d9",
                borderColor: "#30363d",
                textTransform: "none",
                backgroundColor: "#21262d",
              }}
            >
              Fork
            </Button>
          </Box>
        </Box>

        {/* Repository Content Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 3 }}>
          <Box>
            {/* Control Bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
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

            {/* Commit / Files Box */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                mb: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#161b22",
                  borderBottom: "1px solid #30363d",
                  fontSize: "13px",
                  color: "#8b949e",
                }}
              >
                Latest commit status:{" "}
                <span style={{ color: "#f0f6fc", fontWeight: 600 }}>
                  Initial commit
                </span>
              </Box>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  fontSize: "14px",
                }}
              >
                <InsertDriveFileIcon sx={{ fontSize: 18, color: "#8b949e" }} />
                <Typography sx={{ fontSize: "14px" }}>README.md</Typography>
              </Box>
            </Paper>

            {/* Readme Card */}
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid #30363d",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                README.md
              </Box>
              <Box sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  {repo?.name}
                </Typography>
                <Typography sx={{ color: "#8b949e" }}>
                  {repo?.description || "No description provided."}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Sidebar */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 1 }}>
              About
            </Typography>
            <Typography sx={{ color: "#8b949e", fontSize: "14px" }}>
              {repo?.description || "No description provided."}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
