// CommitHistory.jsx — displays repository commits in reverse chronological order.
// Supports review status badges, owner review marking, and web-side commit reverting.
// Talks to: useCommits hook, markCommitReviewed, and revertCommit in api/repositories.js.

import { useState } from "react";
import { Box, Paper, Typography, Chip, Button, Alert } from "@mui/material";
import { HistoryIcon } from "../common/icons";
import useCommits from "../../hooks/useCommits";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import { markCommitReviewed, revertCommit } from "../../api/repositories";

// Computes a human-readable relative time string (e.g. "2 hours ago").
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

// Extracts the plain file name from an S3 storage key.
const fileName = (key) => key.split("/").pop();

// Renders the list of commits with review statuses and revert actions.
export default function CommitHistory({ repoId, commitsState, isOwner = false }) {
  const { commits: sourceCommits, loading, error, reload } = useCommits(repoId, commitsState);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busyCommitId, setBusyCommitId] = useState(null);

  const commits = [...sourceCommits].reverse();
  const latest = commits[0];

  // Calls the server-side revert endpoint and handles conflict detection.
  const handleRevert = async (commitId, commitMsg) => {
    const confirmed = window.confirm(
      `Revert commit ${commitId.slice(-7)} ("${commitMsg}")?\n\nThis creates a new commit restoring earlier file versions.`,
    );
    if (!confirmed) return;

    setActionError("");
    setActionSuccess("");
    setBusyCommitId(commitId);
    try {
      await revertCommit(repoId, commitId);
      setActionSuccess(`Successfully reverted commit ${commitId.slice(-7)}.`);
      if (reload) await reload();
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data?.conflicts) {
        setActionError(
          `Cannot revert: later commits have modified: ${data.conflicts.join(", ")}`,
        );
      } else {
        setActionError(data?.message || err.message || "Failed to revert commit.");
      }
    } finally {
      setBusyCommitId(null);
    }
  };

  // Marks a review-requested commit as reviewed (owner-only).
  const handleMarkReviewed = async (commitId) => {
    setActionError("");
    setActionSuccess("");
    setBusyCommitId(commitId);
    try {
      await markCommitReviewed(repoId, commitId);
      setActionSuccess(`Marked commit ${commitId.slice(-7)} as reviewed.`);
      if (reload) await reload();
    } catch (err) {
      setActionError(
        err.response?.data?.message || err.message || "Failed to mark as reviewed.",
      );
    } finally {
      setBusyCommitId(null);
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
      {/* Header: latest commit + total count */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#161b22",
          borderBottom: "1px solid #30363d",
          fontSize: "13px",
          color: "#8b949e",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          Latest commit:{" "}
          <span style={{ color: "#f0f6fc", fontWeight: 600 }}>
            {latest ? latest.message : "none yet"}
          </span>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "#c9d1d9",
            flexShrink: 0,
          }}
        >
          <HistoryIcon sx={{ fontSize: 16 }} />
          {commits.length} {commits.length === 1 ? "commit" : "commits"}
        </Box>
      </Box>

      {/* Action feedback alerts */}
      {actionError && (
        <Alert
          severity="error"
          onClose={() => setActionError("")}
          sx={{ borderRadius: 0, backgroundColor: "#1f1315", color: "#f85149" }}
        >
          {actionError}
        </Alert>
      )}
      {actionSuccess && (
        <Alert
          severity="success"
          onClose={() => setActionSuccess("")}
          sx={{ borderRadius: 0, backgroundColor: "#121d15", color: "#3fb950" }}
        >
          {actionSuccess}
        </Alert>
      )}

      {loading && <LoadingState message="Loading commits..." />}

      {!loading && error && (
        <Box sx={{ p: 2 }}>
          <ErrorState message={error} onRetry={reload} />
        </Box>
      )}

      {!loading && !error && commits.length === 0 && (
        <EmptyState
          message={
            <>
              No commits yet. Run <code>init</code>, <code>add</code>,{" "}
              <code>commit</code> and <code>push</code> from the CLI to add some.
            </>
          }
        />
      )}

      {!loading &&
        !error &&
        commits.map((commit, i) => {
          const files = (commit.files || []).map(fileName);
          const isBusy = busyCommitId === commit._id;

          return (
            <Box
              key={commit._id}
              sx={{
                p: 2,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                borderTop: i === 0 ? "none" : "1px solid #21262d",
              }}
            >
              <Box sx={{ minWidth: 0, flex: "1 1 300px" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                    {commit.message}
                  </Typography>

                  {/* Review requested / reviewed status badges */}
                  {commit.reviewRequested && !commit.reviewedBy && (
                    <Chip
                      label="Review Requested"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "11px",
                        backgroundColor: "rgba(210, 153, 34, 0.2)",
                        color: "#d29922",
                        border: "1px solid rgba(210, 153, 34, 0.4)",
                      }}
                    />
                  )}
                  {commit.reviewedBy && (
                    <Chip
                      label={`Reviewed by ${commit.reviewedBy.username || "owner"}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "11px",
                        backgroundColor: "rgba(46, 160, 67, 0.2)",
                        color: "#3fb950",
                        border: "1px solid rgba(46, 160, 67, 0.4)",
                      }}
                    />
                  )}

                  {/* Revert of pointer badge */}
                  {commit.revertOf && (
                    <Chip
                      label={`Revert of ${String(commit.revertOf._id || commit.revertOf).slice(-7)}`}
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

                <Typography sx={{ fontSize: "12px", color: "#8b949e", mt: 0.5 }}>
                  {commit.author?.username || "Unknown user"} committed{" "}
                  {timeAgo(commit.createdAt)}
                </Typography>

                {/* Modified file names */}
                {files.length > 0 && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#8b949e",
                      mt: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={files.join(", ")}
                  >
                    Files: {files.join(", ")}
                  </Typography>
                )}

                {/* Removed file names from revert */}
                {(commit.removedFiles || []).length > 0 && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#f85149",
                      mt: 0.25,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={commit.removedFiles.join(", ")}
                  >
                    Removed: {commit.removedFiles.join(", ")}
                  </Typography>
                )}
              </Box>

              {/* Action Buttons & Short ID */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {isOwner && commit.reviewRequested && !commit.reviewedBy && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isBusy}
                    onClick={() => handleMarkReviewed(commit._id)}
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
                    Mark Reviewed
                  </Button>
                )}

                {isOwner && (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isBusy}
                    onClick={() => handleRevert(commit._id, commit.message)}
                    sx={{
                      fontSize: "11px",
                      py: 0.25,
                      px: 1,
                      textTransform: "none",
                      color: "#c9d1d9",
                      borderColor: "#30363d",
                      backgroundColor: "#21262d",
                      "&:hover": { backgroundColor: "#30363d", color: "#f85149" },
                    }}
                  >
                    Revert
                  </Button>
                )}

                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#58a6ff",
                    flexShrink: 0,
                    pl: 0.5,
                  }}
                >
                  {String(commit._id).slice(-7)}
                </Typography>
              </Box>
            </Box>
          );
        })}
    </Paper>
  );
}
