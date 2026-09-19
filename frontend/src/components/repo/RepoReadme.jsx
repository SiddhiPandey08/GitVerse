import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const README_RE = /^readme(\.md|\.markdown|\.txt)?$/i;
const isMarkdown = (name) => /\.(md|markdown)$/i.test(name);

// Keys look like "<repoId>/<commitId>/README.md"; show just the file name.
const fileName = (key) => key.split("/").pop();

// Commits arrive oldest first, so a later commit replaces an earlier version
// of the same file. Prefers README.md over README.txt if both exist.
function findReadme(commits) {
  const byName = new Map();
  for (const commit of commits) {
    for (const key of commit.files || []) {
      const name = fileName(key);
      if (README_RE.test(name)) byName.set(name, { name, key });
    }
  }
  const rank = (name) => (isMarkdown(name) ? 0 : 1);
  return (
    [...byName.values()].sort((a, b) => rank(a.name) - rank(b.name))[0] || null
  );
}

// GitHub-dark styling for the HTML that react-markdown produces.
const markdownSx = {
  p: 4,
  color: "#c9d1d9",
  fontSize: "16px",
  lineHeight: 1.6,
  wordWrap: "break-word",
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    mt: 3,
    mb: 2,
    fontWeight: 600,
    lineHeight: 1.25,
    color: "#f0f6fc",
  },
  "& h1": {
    fontSize: "2em",
    mt: 0,
    pb: "0.3em",
    borderBottom: "1px solid #21262d",
  },
  "& h2": { fontSize: "1.5em", pb: "0.3em", borderBottom: "1px solid #21262d" },
  "& h3": { fontSize: "1.25em" },
  "& p, & ul, & ol, & blockquote, & pre, & table": { mt: 0, mb: 2 },
  "& ul, & ol": { pl: 4 },
  "& li + li": { mt: "0.25em" },
  "& a": { color: "#58a6ff" },
  "& code": {
    fontFamily: "monospace",
    fontSize: "85%",
    backgroundColor: "rgba(110,118,129,0.4)",
    px: "0.4em",
    py: "0.2em",
    borderRadius: "6px",
  },
  "& pre": {
    backgroundColor: "#161b22",
    p: 2,
    overflow: "auto",
    borderRadius: "6px",
    lineHeight: 1.45,
  },
  "& pre code": { backgroundColor: "transparent", p: 0, fontSize: "100%" },
  "& blockquote": {
    m: 0,
    pl: 2,
    color: "#8b949e",
    borderLeft: "0.25em solid #30363d",
  },
  "& table": { borderCollapse: "collapse", display: "block", overflow: "auto" },
  "& th, & td": { border: "1px solid #30363d", px: 1.5, py: 0.75 },
  "& tr:nth-of-type(2n)": { backgroundColor: "#161b22" },
  "& img": { maxWidth: "100%" },
  "& hr": { border: 0, borderTop: "1px solid #30363d", my: 3 },
  "& input[type='checkbox']": { mr: 1 },
};

// Open links in a new tab so readers don't lose the repo page.
const markdownComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export default function RepoReadme({ repoId, name, description }) {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    if (!repoId) return;
    let cancelled = false;

    setState({ status: "loading" });

    (async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/repositories/${repoId}/commits`,
        );
        const readme = findReadme(data.commits || []);
        if (!readme) {
          if (!cancelled) setState({ status: "none" });
          return;
        }

        const res = await axios.get(`${API_URL}/repositories/${repoId}/file`, {
          params: { key: readme.key },
          responseType: "text",
        });
        if (!cancelled) {
          setState({
            status: "ready",
            name: readme.name,
            text: String(res.data),
          });
        }
      } catch (err) {
        // A README that can't load shouldn't break the page: fall back quietly.
        console.error(
          "Error loading README:",
          err.response?.data || err.message,
        );
        if (!cancelled) setState({ status: "none" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [repoId]);

  const headerLabel = state.status === "ready" ? state.name : "README";

  return (
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
        {headerLabel}
      </Box>

      {state.status === "loading" && (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={22} sx={{ color: "#58a6ff" }} />
        </Box>
      )}

      {state.status === "ready" &&
        (isMarkdown(state.name) ? (
          <Box sx={markdownSx}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {state.text}
            </ReactMarkdown>
          </Box>
        ) : (
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 4,
              overflow: "auto",
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#c9d1d9",
            }}
          >
            {state.text}
          </Box>
        ))}

      {state.status === "none" && (
        <Box sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            {name}
          </Typography>
          <Typography sx={{ color: "#8b949e" }}>
            {description || "No description provided."}
          </Typography>
          <Typography sx={{ color: "#8b949e", fontSize: "13px", mt: 3 }}>
            Add a <code>README.md</code> to the repo and push it to show it
            here.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
