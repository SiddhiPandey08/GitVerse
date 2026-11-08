// RepoIssues.jsx — issue tracker panel for repositories with collaboration requests.
// Supports creating issues, flagging collaboration requests, and owner approval.
// Talks to: api/issues.js (getRepoIssues, createIssue, updateIssue, deleteIssue, grantCollaborator).

import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  getRepoIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  grantCollaborator,
} from "../../api/issues";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";

// Computes relative time for issue timestamps.
function timeAgo(dateString) {
  const seconds = Math.round((new Date(dateString) - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(seconds) >= secs) {
      return rtf.format(Math.round(seconds / secs), unit);
    }
  }
  return "just now";
}

// Renders the repository issues list, creation form, and collaborator grant actions.
export default function RepoIssues({ repoId, isOwner = false, currentUserId }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestCollab, setRequestCollab] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Loads issues from the server.
  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getRepoIssues(repoId);
      // Backend returns either an array of issues or a message object when empty
      if (Array.isArray(res.data)) {
        setIssues(res.data);
      } else {
        setIssues([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  }, [repoId]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  // Handles new issue creation.
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    setCreating(true);
    setFormError("");
    try {
      await createIssue({
        repository: repoId,
        title: title.trim(),
        description: description.trim(),
        requestCollaboration: requestCollab,
      });
      setTitle("");
      setDescription("");
      setRequestCollab(false);
      setShowCreateForm(false);
      setActionNotice("Issue created successfully.");
      await loadIssues();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || "Failed to create issue.");
    } finally {
      setCreating(false);
    }
  };

  // Grants collaborator access from an issue request (owner only).
  const handleGrantCollaborator = async (issueId, authorName) => {
    setBusyId(issueId);
    setActionError("");
    setActionNotice("");
    try {
      const res = await grantCollaborator(issueId);
      setActionNotice(res.data?.message || `Granted collaborator access to ${authorName}.`);
      await loadIssues();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || "Failed to grant collaborator access.",
      );
    } finally {
      setBusyId(null);
    }
  };

  // Toggles issue status between open and closed.
  const handleToggleStatus = async (issue) => {
    setBusyId(issue._id);
    setActionError("");
    setActionNotice("");
    const newStatus = issue.status === "open" ? "closed" : "open";
    try {
      await updateIssue(issue._id, { status: newStatus });
      setActionNotice(`Issue marked as ${newStatus}.`);
      await loadIssues();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || "Failed to update issue status.",
      );
    } finally {
      setBusyId(null);
    }
  };

  // Deletes an issue.
  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    setBusyId(issueId);
    setActionError("");
    setActionNotice("");
    try {
      await deleteIssue(issueId);
      setActionNotice("Issue deleted.");
      await loadIssues();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || "Failed to delete issue.",
      );
    } finally {
      setBusyId(null);
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
      {/* Header bar */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#161b22",
          borderBottom: "1px solid #30363d",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#f0f6fc" }}>
          Issues ({issues.length})
        </Typography>

        <Button
          size="small"
          variant="contained"
          onClick={() => setShowCreateForm((prev) => !prev)}
          sx={{
            backgroundColor: "#238636",
            textTransform: "none",
            fontSize: "12px",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#2ea043" },
          }}
        >
          {showCreateForm ? "Cancel" : "New Issue"}
        </Button>
      </Box>

      {/* Global Action Notices */}
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

      {/* New Issue Collapsible Form */}
      {showCreateForm && (
        <Box
          component="form"
          onSubmit={handleCreateIssue}
          sx={{
            p: 2.5,
            borderBottom: "1px solid #30363d",
            backgroundColor: "#161b22",
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 1.5, color: "#f0f6fc" }}>
            Open a New Issue
          </Typography>

          {formError && (
            <Alert severity="error" sx={{ mb: 2, py: 0, fontSize: "12px" }}>
              {formError}
            </Alert>
          )}

          <TextField
            fullWidth
            size="small"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={creating}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#0d1117",
                color: "#c9d1d9",
                "& fieldset": { borderColor: "#30363d" },
                "&:hover fieldset": { borderColor: "#58a6ff" },
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Describe the issue or propose your collaboration..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={creating}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#0d1117",
                color: "#c9d1d9",
                "& fieldset": { borderColor: "#30363d" },
                "&:hover fieldset": { borderColor: "#58a6ff" },
              },
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={requestCollab}
                onChange={(e) => setRequestCollab(e.target.checked)}
                disabled={creating}
                sx={{
                  color: "#8b949e",
                  "&.Mui-checked": { color: "#58a6ff" },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "13px", color: "#c9d1d9" }}>
                Request to be added as a collaborator on this repository
              </Typography>
            }
            sx={{ mb: 1.5 }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              type="submit"
              size="small"
              variant="contained"
              disabled={creating}
              sx={{
                backgroundColor: "#238636",
                textTransform: "none",
                fontSize: "12px",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#2ea043" },
              }}
            >
              {creating ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : "Submit Issue"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={creating}
              onClick={() => setShowCreateForm(false)}
              sx={{
                color: "#8b949e",
                borderColor: "#30363d",
                textTransform: "none",
                fontSize: "12px",
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {loading && <LoadingState message="Loading issues..." />}

      {!loading && error && (
        <Box sx={{ p: 2 }}>
          <ErrorState message={error} onRetry={loadIssues} />
        </Box>
      )}

      {!loading && !error && issues.length === 0 && (
        <EmptyState message="No issues found for this repository." />
      )}

      {/* Issues list */}
      {!loading &&
        !error &&
        issues.map((issue, idx) => {
          const isAuthor =
            currentUserId && String(issue.author?._id || issue.author) === String(currentUserId);
          const canManage = isOwner || isAuthor;
          const isBusy = busyId === issue._id;

          return (
            <Box
              key={issue._id}
              sx={{
                p: 2,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                borderTop: idx === 0 ? "none" : "1px solid #21262d",
              }}
            >
              <Box sx={{ minWidth: 0, flex: "1 1 300px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                  {/* Status chip */}
                  <Chip
                    label={issue.status}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      backgroundColor:
                        issue.status === "open"
                          ? "rgba(46, 160, 67, 0.2)"
                          : "rgba(137, 87, 229, 0.2)",
                      color: issue.status === "open" ? "#3fb950" : "#a371f7",
                      border: `1px solid ${
                        issue.status === "open"
                          ? "rgba(46, 160, 67, 0.4)"
                          : "rgba(137, 87, 229, 0.4)"
                      }`,
                    }}
                  />

                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#f0f6fc" }}>
                    {issue.title}
                  </Typography>

                  {/* Collaboration request badge */}
                  {issue.requestCollaboration && (
                    <Chip
                      label="Collaboration Request"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "11px",
                        backgroundColor: "rgba(88, 166, 255, 0.15)",
                        color: "#58a6ff",
                        border: "1px solid rgba(88, 166, 255, 0.3)",
                      }}
                    />
                  )}
                </Box>

                <Typography sx={{ fontSize: "13px", color: "#c9d1d9", mb: 0.75, whiteSpace: "pre-wrap" }}>
                  {issue.description}
                </Typography>

                <Typography sx={{ fontSize: "12px", color: "#8b949e" }}>
                  opened by{" "}
                  {issue.author?._id ? (
                    <Link to={`/users/${issue.author._id}`}>
                      {issue.author.username}
                    </Link>
                  ) : (
                    "Unknown"
                  )}{" "}
                  {timeAgo(issue.createdAt)}
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                {/* Owner Grant Collaborator button */}
                {isOwner && issue.requestCollaboration && issue.status === "open" && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isBusy}
                    onClick={() =>
                      handleGrantCollaborator(issue._id, issue.author?.username || "user")
                    }
                    sx={{
                      fontSize: "11px",
                      py: 0.25,
                      px: 1,
                      textTransform: "none",
                      color: "#3fb950",
                      borderColor: "#238636",
                      backgroundColor: "rgba(35, 134, 54, 0.1)",
                      "&:hover": { backgroundColor: "rgba(35, 134, 54, 0.2)" },
                    }}
                  >
                    Grant Collaborator
                  </Button>
                )}

                {/* Status Toggle Button (Author or Owner) */}
                {canManage && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isBusy}
                    onClick={() => handleToggleStatus(issue)}
                    sx={{
                      fontSize: "11px",
                      py: 0.25,
                      px: 1,
                      textTransform: "none",
                      color: "#c9d1d9",
                      borderColor: "#30363d",
                      backgroundColor: "#21262d",
                      "&:hover": { backgroundColor: "#30363d" },
                    }}
                  >
                    {issue.status === "open" ? "Close" : "Reopen"}
                  </Button>
                )}

                {/* Delete Button (Author or Owner) */}
                {canManage && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={isBusy}
                    onClick={() => handleDeleteIssue(issue._id)}
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
                    Delete
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
    </Paper>
  );
}
