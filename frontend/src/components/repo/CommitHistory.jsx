import { Box, Paper, Typography } from "@mui/material";
import { HistoryIcon } from "../common/icons";
import useCommits from "../../hooks/useCommits";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";

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

export default function CommitHistory({ repoId, commitsState }) {
  const { commits: sourceCommits, loading, error, reload } = useCommits(repoId, commitsState);
  const commits = [...sourceCommits].reverse();

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
        <LoadingState message="Loading commits..." />
      )}

      {!loading && error && (
        <Box sx={{ p: 2 }}><ErrorState message={error} onRetry={reload} /></Box>
      )}

      {!loading && !error && commits.length === 0 && (
        <EmptyState message={
          <>
          No commits yet. Run <code>init</code>, <code>add</code>,{" "}
          <code>commit</code> and <code>push</code> from the CLI to add some.
          </>
        } />
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
