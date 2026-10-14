import { useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonBase,
  CircularProgress,
} from "@mui/material";
import {
  InsertDriveFileIcon,
  DownloadIcon,
  CloseIcon,
} from "../common/icons";

import useCommits from "../../hooks/useCommits";
import useRepoFile from "../../hooks/useRepoFile";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
const MAX_PREVIEW_BYTES = 1024 * 1024; // 1 MB

const TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "json",
  "js",
  "jsx",
  "ts",
  "tsx",
  "css",
  "scss",
  "html",
  "xml",
  "yml",
  "yaml",
  "toml",
  "ini",
  "env",
  "csv",
  "log",
  "sh",
  "bat",
  "py",
  "java",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "go",
  "rs",
  "rb",
  "php",
  "sql",
  "gitignore",
]);
const SECRET_FILE_RE =
  /(^|\/)(\.env(\..*)?|.*\.(pem|key|p12|pfx|crt|cer)|id_(rsa|dsa|ecdsa)|authorized_keys)$/i;

// Keys look like "<repoId>/<commitId>/hello.txt"; show just the file name.
const fileName = (key) => key.split("/").pop();

// Files with no extension (README, LICENSE, Makefile) are tried as text too.
function isTextLike(name) {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return true;
  return TEXT_EXTENSIONS.has(name.slice(dot + 1).toLowerCase());
}

export function isSecretLike(name) {
  return SECRET_FILE_RE.test(name);
}

// Commits arrive oldest first, so a later commit replaces an earlier
// version of the same file name. The result is the repo's current files.
function currentFiles(commits) {
  const byName = new Map();
  for (const commit of commits) {
    for (const key of commit.files || []) {
      byName.set(fileName(key), { name: fileName(key), key, commit });
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function RepoFiles({ repoId, commitsState }) {
  const [selected, setSelected] = useState(null);
  const [viewer, setViewer] = useState({ status: "idle" });
  const requestId = useRef(0);
  const { commits, loading, error, reload } = useCommits(repoId, commitsState);
  const files = currentFiles(commits);
  const { load: loadFile } = useRepoFile(repoId);

  const openFile = async (file) => {
    const id = ++requestId.current; // ignore results from files clicked earlier
    setSelected(file);

    if (isSecretLike(file.name)) {
      setViewer({
        status: "nopreview",
        message: "Preview is disabled for secret-like files.",
      });
      return;
    }

    if (!isTextLike(file.name)) {
      setViewer({
        status: "nopreview",
        message: "Preview isn't available for this file type.",
      });
      return;
    }

    setViewer({ status: "loading" });
    try {
      const blob = await loadFile(file.key);
      if (id !== requestId.current) return;

      if (blob.size > MAX_PREVIEW_BYTES) {
        setViewer({
          status: "nopreview",
          message: `This file is too large to preview (${Math.round(blob.size / 1024)} KB).`,
        });
        return;
      }
      const text = await blob.text();
      if (id !== requestId.current) return;

      if (text.includes("\u0000")) {
        setViewer({
          status: "nopreview",
          message: "This looks like a binary file, so it can't be previewed.",
        });
        return;
      }
      setViewer({ status: "text", text });
    } catch (err) {
      if (id !== requestId.current) return;
      console.error("Error opening file:", err.message);
      setViewer({ status: "error", message: err.message || "Couldn't load the file." });
    }
  };

  const closeFile = () => {
    requestId.current++;
    setSelected(null);
  };

  const downloadFile = async (file) => {
    try {
      const blob = await loadFile(file.key);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err.message);
      setViewer({ status: "error", message: err.message || "Couldn't download the file." });
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
      <Box
        sx={{
          p: 2,
          backgroundColor: "#161b22",
          borderBottom: "1px solid #30363d",
          fontSize: "13px",
          color: "#c9d1d9",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Files</span>
        <span style={{ color: "#8b949e", fontWeight: 400 }}>
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </Box>

      {loading && <LoadingState message="Loading files..." />}

      {!loading && error && (
        <Box sx={{ p: 2 }}>
          <ErrorState message={error} onRetry={reload} />
        </Box>
      )}

      {!loading && !error && files.length === 0 && (
        <EmptyState message="No files yet. Add a file and run commit and push from the CLI." />
      )}

      {!loading &&
        !error &&
        files.map((file, i) => (
          <ButtonBase
            key={file.key}
            onClick={() => openFile(file)}
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              textAlign: "left",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderTop: i === 0 ? "none" : "1px solid #21262d",
              backgroundColor:
                selected?.name === file.name ? "#161b22" : "transparent",
              "&:hover": { backgroundColor: "#161b22" },
            }}
          >
            <InsertDriveFileIcon sx={{ fontSize: 18, color: "#8b949e" }} />
            <Typography
              sx={{ fontSize: "14px", color: "#58a6ff", flexShrink: 0 }}
            >
              {file.name}
            </Typography>
            <Typography
              sx={{
                fontSize: "13px",
                color: "#8b949e",
                ml: "auto",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {file.commit.message}
            </Typography>
          </ButtonBase>
        ))}

      {selected && (
        <Box sx={{ borderTop: "1px solid #30363d" }}>
          <Box
            sx={{
              p: 1.5,
              px: 2,
              backgroundColor: "#161b22",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
              {selected.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadFile(selected)}
                sx={{
                  color: "#c9d1d9",
                  borderColor: "#30363d",
                  textTransform: "none",
                  backgroundColor: "#21262d",
                  "&:hover": { backgroundColor: "#30363d" },
                }}
              >
                Download
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={closeFile}
                sx={{
                  color: "#c9d1d9",
                  borderColor: "#30363d",
                  textTransform: "none",
                  backgroundColor: "#21262d",
                  "&:hover": { backgroundColor: "#30363d" },
                }}
              >
                Close
              </Button>
            </Box>
          </Box>

          {viewer.status === "loading" && (
            <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={22} sx={{ color: "#58a6ff" }} />
            </Box>
          )}

          {viewer.status === "text" &&
            (viewer.text === "" ? (
              <Typography sx={{ p: 2, fontSize: "14px", color: "#8b949e" }}>
                This file is empty.
              </Typography>
            ) : (
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 2,
                  overflow: "auto",
                  maxHeight: 480,
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#c9d1d9",
                }}
              >
                {viewer.text}
              </Box>
            ))}

          {viewer.status === "nopreview" && (
            <Typography sx={{ p: 2, fontSize: "14px", color: "#8b949e" }}>
              {viewer.message} Use Download to open it.
            </Typography>
          )}

          {viewer.status === "error" && (
            <Typography sx={{ p: 2, fontSize: "14px", color: "#f85149" }}>
              {viewer.message}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
