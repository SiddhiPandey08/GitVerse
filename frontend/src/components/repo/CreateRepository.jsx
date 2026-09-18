import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Paper,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/Public";

export default function CreateRepository() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repoName.trim()) {
      setError("Repository name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/repositories/create",
        {
          name: repoName,
          description,
          visibility: visibility,
          owner: userId,
        },
      );

      const newRepo = response.data.repository || response.data;
      if (newRepo?._id) {
        navigate(`/repositories/${newRepo._id}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating repository:", err);
      setError(err.response?.data?.message || "Failed to create repository.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#f0f6fc" }}
    >
      <Navbar />

      <Box sx={{ maxWidth: "768px", mx: "auto", px: 3, py: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Create a new repository
        </Typography>
        <Typography sx={{ color: "#8b949e", fontSize: "14px", mb: 3 }}>
          A repository contains all project files, including the revision
          history.
        </Typography>

        <Divider sx={{ borderColor: "#30363d", mb: 4 }} />

        {error && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "rgba(248,81,73,0.1)",
              border: "1px solid #f85149",
              color: "#f85149",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {error}
          </Paper>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Repository Name */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 1 }}>
              Repository name *
            </Typography>
            <TextField
              fullWidth
              required
              placeholder="my-awesome-project"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "#010409",
                  color: "#f0f6fc",
                  fontSize: "14px",
                  borderRadius: "6px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#30363d",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b949e",
                },
              }}
            />
          </Box>

          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, mb: 1 }}>
              Description{" "}
              <span style={{ color: "#8b949e", fontWeight: 400 }}>
                (optional)
              </span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Short description about your repository..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "#010409",
                  color: "#f0f6fc",
                  fontSize: "14px",
                  borderRadius: "6px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#30363d",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b949e",
                },
              }}
            />
          </Box>

          <Divider sx={{ borderColor: "#30363d", mb: 3 }} />

          {/* Visibility Option */}
          <FormControl component="fieldset" sx={{ width: "100%", mb: 4 }}>
            <RadioGroup
              value={visibility ? "public" : "private"}
              onChange={(e) => setVisibility(e.target.value === "public")}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1.5,
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                <FormControlLabel
                  value="public"
                  control={
                    <Radio
                      sx={{
                        color: "#8b949e",
                        "&.Mui-checked": { color: "#58a6ff" },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <PublicIcon sx={{ fontSize: 18, color: "#8b949e" }} />
                        <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                          Public
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ color: "#8b949e", fontSize: "12px", mt: 0.5 }}
                      >
                        Anyone on the internet can see this repository. You
                        choose who can commit.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                <FormControlLabel
                  value="private"
                  control={
                    <Radio
                      sx={{
                        color: "#8b949e",
                        "&.Mui-checked": { color: "#58a6ff" },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ ml: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LockOutlinedIcon
                          sx={{ fontSize: 18, color: "#e3b341" }}
                        />
                        <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                          Private
                        </Typography>
                      </Box>
                      <Typography
                        sx={{ color: "#8b949e", fontSize: "12px", mt: 0.5 }}
                      >
                        You choose who can see and commit to this repository.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </RadioGroup>
          </FormControl>

          <Divider sx={{ borderColor: "#30363d", mb: 4 }} />

          {/* Submit Action */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !repoName.trim()}
              sx={{
                backgroundColor: "#238636",
                color: "#ffffff",
                fontWeight: 600,
                textTransform: "none",
                px: 3,
                py: 1,
                borderRadius: "6px",
                "&:hover": { backgroundColor: "#2ea043" },
              }}
            >
              {loading ? "Creating repository..." : "Create repository"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{
                color: "#c9d1d9",
                borderColor: "#30363d",
                textTransform: "none",
                px: 3,
                borderRadius: "6px",
                "&:hover": { backgroundColor: "#21262d" },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
