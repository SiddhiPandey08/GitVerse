import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

// Keys look like "<repoId>/<commitId>/hello.txt"; show just the file name.
const fileName = (key) => key.split("/").pop();

export default function CommitHistory({ repoId }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!repoId) return;
    let cancelled = false;

    setLoading(true);
    setError("");

    axios
      .get(`${API_URL}/repositories/${repoId}/commits`)
      .then((res) => {
        // The API returns oldest first; show newest first.
        if (!cancelled) setCommits([...(res.data.commits || [])].reverse());
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(
          "Error fetching commits:",
          err.response?.data || err.message,
        );
        const status = err.response?.status;
        if (status === 401) {
          setError("Your session has expired. Log in again to see commits.");
        } else if (status === 403) {
          setError("Only the repository owner can view its commits.");
        } else {
          setError("Couldn't load commits. Check that the server is running.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [repoId]);

  const latest = commits[0];

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

      {loading && (
        <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={22} sx={{ color: "#58a6ff" }} />
        </Box>
      )}

      {!loading && error && (
        <Typography sx={{ p: 2, fontSize: "14px", color: "#f85149" }}>
          {error}
        </Typography>
      )}

      {!loading && !error && commits.length === 0 && (
        <Typography sx={{ p: 2, fontSize: "14px", color: "#8b949e" }}>
          No commits yet. Run <code>init</code>, <code>add</code>,{" "}
          <code>commit</code> and <code>push</code> from the CLI to add some.
        </Typography>
      )}

      {!loading &&
        !error &&
        commits.map((commit, i) => {
          const files = (commit.files || []).map(fileName);
          return (
            <Box
              key={commit._id}
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
                borderTop: i === 0 ? "none" : "1px solid #21262d",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
                  {commit.message}
                </Typography>
                <Typography
                  sx={{ fontSize: "12px", color: "#8b949e", mt: 0.5 }}
                >
                  {commit.author?.username || "Unknown user"} committed{" "}
                  {timeAgo(commit.createdAt)}
                </Typography>
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
                    {files.join(", ")}
                  </Typography>
                )}
              </Box>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#58a6ff",
                  flexShrink: 0,
                }}
              >
                {String(commit._id).slice(-7)}
              </Typography>
            </Box>
          );
        })}
    </Paper>
  );
}
