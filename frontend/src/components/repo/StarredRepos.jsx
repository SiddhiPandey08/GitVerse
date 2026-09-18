import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import { Box, Typography, Paper, Chip, Tabs, Tab } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export default function StarredRepos() {
  const navigate = useNavigate();
  const [starredRepos, setStarredRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchStarredRepos = async () => {
      if (!userId) return;
      try {
        // Attempt fetching dedicated starred repositories
        const response = await axios.get(
          `http://localhost:3000/repositories/starred/${userId}`,
        );
        const repos = response.data.repositories || response.data || [];
        setStarredRepos(repos);
      } catch (err) {
        // Fallback: Fetch user repositories and filter explicitly by starred status
        try {
          const fallbackResponse = await axios.get(
            `http://localhost:3000/repositories/user/${userId}`,
          );
          const allRepos =
            fallbackResponse.data.repositories || fallbackResponse.data || [];

          // Only keep repositories that are explicitly starred
          const filtered = allRepos.filter(
            (repo) => repo.isStarred === true || repo.starred === true,
          );
          setStarredRepos(filtered);
        } catch (fallbackErr) {
          console.error("Error fetching repositories:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStarredRepos();
  }, [userId]);

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#f0f6fc" }}
    >
      <Navbar />

      {/* Profile/Starred Navigation Tabs */}
      <Box
        sx={{
          borderBottom: "1px solid #30363d",
          px: { xs: 2, md: 4 },
          backgroundColor: "#0d1117",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Tabs
          value={1}
          sx={{
            minHeight: "48px",
            "& .MuiTabs-indicator": { height: 2, backgroundColor: "#f78166" },
            "& .MuiTab-root": {
              color: "#8b949e",
              textTransform: "none",
              fontSize: "14px",
              minHeight: "48px",
              fontWeight: 500,
              px: 2,
              "&:hover": { color: "#f0f6fc" },
              "&.Mui-selected": { color: "#f0f6fc", fontWeight: 600 },
            },
          }}
        >
          <Tab
            icon={<MenuBookIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Overview"
            onClick={() => navigate("/profile")}
          />
          <Tab
            icon={<StarBorderIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Starred Repositories"
          />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box sx={{ maxWidth: "1280px", mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Starred Repositories
        </Typography>

        {loading ? (
          <Typography sx={{ color: "#8b949e" }}>
            Loading starred repositories...
          </Typography>
        ) : starredRepos.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "6px",
            }}
          >
            <Typography sx={{ color: "#8b949e", fontSize: "16px" }}>
              You don't have any starred repositories yet.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {starredRepos.map((repo) => (
              <Paper
                key={repo._id}
                elevation={0}
                onClick={() => navigate(`/repositories/${repo._id}`)}
                sx={{
                  p: 2.5,
                  backgroundColor: "#0d1117",
                  border: "1px solid #30363d",
                  borderRadius: "6px",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#8b949e" },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <svg
                    aria-hidden="true"
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                    fill="#8b949e"
                  >
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-11h-8a1 1 0 0 0-1 1v11.5a.75.75 0 0 1-1.5 0V2.5zM1.75 6A1.75 1.75 0 0 0 0 7.75v6.5C0 15.216.784 16 1.75 16h8.5A1.75 1.75 0 0 0 12 14.25v-6.5A1.75 1.75 0 0 0 10.25 6h-8.5zM1.5 7.75a.25.25 0 0 1 .25-.25h8.5a.25.25 0 0 1 .25.25v6.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-6.5z"></path>
                  </svg>
                  <Typography
                    sx={{ color: "#58a6ff", fontWeight: 600, fontSize: "16px" }}
                  >
                    {repo.name}
                  </Typography>
                  <Chip
                    label={
                      repo.visibility === true || repo.visibility === "Public"
                        ? "Public"
                        : "Private"
                    }
                    size="small"
                    sx={{
                      color: "#8b949e",
                      backgroundColor: "transparent",
                      border: "1px solid #30363d",
                      fontSize: "12px",
                      height: "20px",
                    }}
                  />
                </Box>
                {repo.description && (
                  <Typography sx={{ color: "#8b949e", fontSize: "14px" }}>
                    {repo.description}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
