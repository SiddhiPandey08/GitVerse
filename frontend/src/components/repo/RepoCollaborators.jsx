// RepoCollaborators.jsx — collaborator management panel for repositories.
// Allows owners to list, add, and remove repository collaborators with live socket room eviction.
// Talks to: api/repositories.js (listCollaborators, addCollaborator, removeCollaborator).

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  listCollaborators,
  addCollaborator,
  removeCollaborator,
} from "../../api/repositories";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";

// Displays and manages collaborators for a repository.
export default function RepoCollaborators({ repoId, isOwner = false }) {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyUser, setBusyUser] = useState(null);

  // Loads current collaborators list.
  const loadCollaborators = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCollaborators(repoId);
      setCollaborators(res.data?.collaborators || []);
    } catch (err) {
      // If non-owner hits 403 on this specific endpoint, fail gracefully
      if (err.response?.status === 403) {
        setError("Only repository owners can view the detailed collaborators management list.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to load collaborators.");
      }
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    loadCollaborators();
  }, [loadCollaborators]);

  // Adds a user as a collaborator.
  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    const target = username.trim();
    if (!target) return;

    setSubmitting(true);
    setActionError("");
    setActionNotice("");
    try {
      const res = await addCollaborator(repoId, target);
      setCollaborators(res.data?.collaborators || []);
      setUsername("");
      setActionNotice(res.data?.message || `Added ${target} as collaborator.`);
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || "Failed to add collaborator.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Removes a collaborator by username.
  const handleRemoveCollaborator = async (targetUsername) => {
    if (!window.confirm(`Remove ${targetUsername} from collaborators?`)) return;

    setBusyUser(targetUsername);
    setActionError("");
    setActionNotice("");
    try {
      const res = await removeCollaborator(repoId, targetUsername);
      setCollaborators(res.data?.collaborators || []);
      setActionNotice(
        res.data?.message || `Removed ${targetUsername} from collaborators.`,
      );
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || "Failed to remove collaborator.",
      );
    } finally {
      setBusyUser(null);
    }
  };

  return (
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
      {/* Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#161b22",
          borderBottom: "1px solid #30363d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#f0f6fc" }}>
          Collaborators ({collaborators.length})
        </Typography>
        {isOwner ? (
          <Chip
            label="Owner Access"
            size="small"
            sx={{
              height: 20,
              fontSize: "11px",
              backgroundColor: "rgba(46, 160, 67, 0.2)",
              color: "#3fb950",
              border: "1px solid rgba(46, 160, 67, 0.4)",
            }}
          />
        ) : (
          <Chip
            label="Read-Only"
            size="small"
            sx={{
              height: 20,
              fontSize: "11px",
              backgroundColor: "rgba(139, 148, 158, 0.2)",
              color: "#8b949e",
            }}
          />
        )}
      </Box>

      {/* Global Notices */}
      {actionNotice && (
        <Alert
          severity="success"
          onClose={() => setActionNotice("")}
          sx={{ borderRadius: 0, backgroundColor: "#121d15", color: "#3fb950" }}
        >
          {actionNotice}
        </Alert>
      )}
      {actionError && (
        <Alert
          severity="error"
          onClose={() => setActionError("")}
          sx={{ borderRadius: 0, backgroundColor: "#1f1315", color: "#f85149" }}
        >
          {actionError}
        </Alert>
      )}

      {/* Add collaborator form (owner only) */}
      {isOwner && (
        <Box
          component="form"
          onSubmit={handleAddCollaborator}
          sx={{
            p: 2,
            borderBottom: "1px solid #30363d",
            backgroundColor: "#161b22",
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Username to add..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
            sx={{
              flex: "1 1 200px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#0d1117",
                color: "#c9d1d9",
                fontSize: "13px",
                "& fieldset": { borderColor: "#30363d" },
                "&:hover fieldset": { borderColor: "#58a6ff" },
              },
            }}
          />
          <Button
            type="submit"
            size="small"
            variant="contained"
            disabled={submitting || !username.trim()}
            sx={{
              backgroundColor: "#238636",
              textTransform: "none",
              fontSize: "12px",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#2ea043" },
            }}
          >
            {submitting ? (
              <CircularProgress size={14} sx={{ color: "#fff" }} />
            ) : (
              "Add Collaborator"
            )}
          </Button>
        </Box>
      )}

      {loading && <LoadingState message="Loading collaborators..." />}

      {!loading && error && (
        <Box sx={{ p: 2 }}>
          <ErrorState message={error} onRetry={loadCollaborators} />
        </Box>
      )}

      {!loading && !error && collaborators.length === 0 && (
        <EmptyState message="No collaborators have been added yet." />
      )}

      {/* Collaborator List */}
      {!loading && !error && collaborators.length > 0 && (
        <List disablePadding>
          {collaborators.map((collab, index) => {
            const name = typeof collab === "string" ? collab : collab?.username || "Unknown";
            const isBusy = busyUser === name;

            return (
              <ListItem
                key={collab._id || name || index}
                sx={{
                  borderTop: index === 0 ? "none" : "1px solid #21262d",
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#f0f6fc" }}>
                      {name}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ fontSize: "12px", color: "#8b949e" }}>
                      Write access to push code and participate in team channels
                    </Typography>
                  }
                />

                {isOwner && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={isBusy}
                    onClick={() => handleRemoveCollaborator(name)}
                    sx={{
                      fontSize: "11px",
                      py: 0.25,
                      px: 1,
                      textTransform: "none",
                      color: "#f85149",
                      borderColor: "#30363d",
                      backgroundColor: "#21262d",
                      "&:hover": { backgroundColor: "rgba(248,81,73,0.1)" },
                    }}
                  >
                    Remove
                  </Button>
                )}
              </ListItem>
            );
          })}
        </List>
      )}
    </Paper>
  );
}

