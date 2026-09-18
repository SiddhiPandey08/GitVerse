import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import HeatMapProfile from "./HeatMap";

import {
  Box,
  Typography,
  Button,
  Avatar,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleOutlineIcon from "@mui/icons-material/PeopleAlt"; // Updated import name
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOn"; // Updated import name
import LinkOutlinedIcon from "@mui/icons-material/Link"; // Updated import name
export default function Profile() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    bio: "",
    followersCount: 0,
    followingCount: 0,
  });

  const userId = localStorage.getItem("userId");
  const [userRepos, setUserRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    const fetchUserRepos = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(
          `http://localhost:3000/repositories/owner/${userId}`,
        );
        setUserRepos(response.data.repositories || []);
      } catch (err) {
        console.error("Cannot fetch user repositories:", err);
      } finally {
        setLoadingRepos(false);
      }
    };

    fetchUserRepos();
  }, [userId]);
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/users/userProfile/${userId}`,
        );
        setUserDetails(response.data);
      } catch (err) {
        console.error("Cannot fetch user details:", err);
      }
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#f0f6fc" }}
    >
      <Navbar />

      {/* Top Header Navigation Tabs */}
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
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            minHeight: "48px",
            "& .MuiTabs-indicator": {
              height: 2,
              backgroundColor: "#f78166", // Active tab line color
            },
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
          />
          <Tab
            icon={<StarBorderIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Starred Repositories"
            onClick={() => navigate("/starredRepo")}
          />
        </Tabs>
      </Box>

      {/* Main Container - GitHub 2-Column Split */}
      <Box
        sx={{
          maxWidth: "1280px",
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Stacks on mobile, side-by-side on desktop
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        {/* Left Sidebar: User Profile Info */}
        <Box
          sx={{
            width: { xs: "100%", md: "296px" }, // Fixed GitHub sidebar width
            flexShrink: 0,
          }}
        >
          <Avatar
            src={userDetails.avatarUrl || ""}
            sx={{
              width: { xs: 160, md: 260 },
              height: { xs: 160, md: 260 },
              backgroundColor: "#21262d",
              border: "1px solid #30363d",
              fontSize: { xs: 60, md: 96 },
              mb: 2,
            }}
          >
            {userDetails.username?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Typography
            variant="h1"
            sx={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#f0f6fc",
              lineHeight: 1.25,
            }}
          >
            {userDetails.name || userDetails.username}
          </Typography>
          <Typography
            sx={{ fontSize: "20px", color: "#8b949e", fontWeight: 300, mb: 2 }}
          >
            {userDetails.username}
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/edit-profile")}
            sx={{
              color: "#f0f6fc",
              backgroundColor: "#21262d",
              borderColor: "rgba(240,246,252,0.1)",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              py: 0.75,
              mb: 2,
              "&:hover": {
                backgroundColor: "#30363d",
                borderColor: "#8b949e",
              },
            }}
          >
            Edit profile
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#8b949e",
              fontSize: "14px",
            }}
          >
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              width="16"
              fill="#8b949e"
            >
              <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5zM5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
            </svg>
            <Typography
              component="span"
              sx={{ fontSize: "14px", color: "#8b949e" }}
            >
              <strong style={{ color: "#f0f6fc" }}>
                {userDetails.followersCount || 0}
              </strong>{" "}
              followers
            </Typography>
            •
            <Typography
              component="span"
              sx={{ fontSize: "14px", color: "#8b949e" }}
            >
              <strong style={{ color: "#f0f6fc" }}>
                {userDetails.followingCount || 0}
              </strong>{" "}
              following
            </Typography>
          </Box>
        </Box>

        {/* Right Main Content Panel */}
        {/* Right Main Content Panel */}
        <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
          {/* Pinned / Popular Repositories Section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#f0f6fc",
                mb: 2,
                display: "flex",
                justify: "space-between",
                alignItems: "center",
              }}
            >
              Your Repositories
            </Typography>

            {loadingRepos ? (
              <Typography sx={{ color: "#8b949e", fontSize: "14px" }}>
                Loading repositories...
              </Typography>
            ) : userRepos.length === 0 ? (
              <Typography sx={{ color: "#8b949e", fontSize: "14px" }}>
                No public repositories found.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, // 2-column grid like GitHub
                  gap: 2,
                }}
              >
                {userRepos.slice(0, 6).map((repo) => (
                  <Box
                    key={repo._id}
                    onClick={() => navigate(`/repositories/${repo._id}`)}
                    sx={{
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      p: 2,
                      backgroundColor: "#0d1117",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      "&:hover": {
                        borderColor: "#8b949e",
                      },
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {/* Repo Book Icon */}
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
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#58a6ff",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {repo.name}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#8b949e",
                            border: "1px solid #30363d",
                            borderRadius: "12px",
                            px: 1,
                            py: 0.2,
                          }}
                        >
                          {repo.visibility === true ||
                          repo.visibility === "Public"
                            ? "Public"
                            : "Private"}
                        </Typography>
                      </Box>

                      {repo.description && (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#8b949e",
                            mb: 2,
                            lineHeight: 1.4,
                          }}
                        >
                          {repo.description}
                        </Typography>
                      )}
                    </Box>

                    {/* Language & Metadata */}
                    {repo.language && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: repo.languageColor || "#388bfd",
                            display: "inline-block",
                          }}
                        ></span>
                        <Typography sx={{ fontSize: "12px", color: "#8b949e" }}>
                          {repo.language}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Contribution Heatmap Section */}
          <Box
            sx={{
              border: "1px solid #30363d",
              borderRadius: "6px",
              p: 2,
              backgroundColor: "#0d1117",
            }}
          >
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#f0f6fc",
                mb: 2,
              }}
            >
              Contributions
            </Typography>
            <HeatMapProfile userId={userId} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
