import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../navbar/Navbar";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Alert,
} from "@mui/material";
import { useAuth } from "../../authContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const { currUser } = useAuth();
  const userId = localStorage.getItem("userId");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(
          `http://localhost:3000/user/profile/${userId}`,
        );
        const data = response.data.user || response.data;
        setUsername(data.username || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        setLocation(data.location || "");
        setWebsite(data.website || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Fallback to auth context if available
        if (currUser) {
          setUsername(currUser.username || "");
          setEmail(currUser.email || "");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.put(`http://localhost:3000/users/updateProfile/${userId}`, {
        username,
        email,
        bio,
        location,
        website,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <Box
      sx={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#f0f6fc" }}
    >
      <Navbar />

      <Box
        sx={{
          maxWidth: "768px",
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 5,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Public profile
        </Typography>
        <Typography sx={{ color: "#8b949e", fontSize: "14px", mb: 3 }}>
          Manage how your details appear to other users on GitVerse.
        </Typography>

        <Divider sx={{ borderColor: "#30363d", mb: 4 }} />

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        {loading ? (
          <Typography sx={{ color: "#8b949e" }}>
            Loading profile details...
          </Typography>
        ) : (
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 4,
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "6px",
            }}
          >
            {/* Avatar Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#21262d",
                  border: "1px solid #30363d",
                  fontSize: "32px",
                  fontWeight: 600,
                  color: "#f0f6fc",
                }}
              >
                {userInitial}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "18px" }}>
                  {username || "User"}
                </Typography>
                <Typography sx={{ color: "#8b949e", fontSize: "13px" }}>
                  Your profile picture is generated from your username.
                </Typography>
              </Box>
            </Box>

            {/* Inputs */}
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#f0f6fc",
                  "& fieldset": { borderColor: "#30363d" },
                  "&:hover fieldset": { borderColor: "#8b949e" },
                  "&.Mui-focused fieldset": { borderColor: "#58a6ff" },
                },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#f0f6fc",
                  "& fieldset": { borderColor: "#30363d" },
                  "&:hover fieldset": { borderColor: "#8b949e" },
                  "&.Mui-focused fieldset": { borderColor: "#58a6ff" },
                },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Bio"
              placeholder="Add a short bio..."
              variant="outlined"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#f0f6fc",
                  "& fieldset": { borderColor: "#30363d" },
                  "&:hover fieldset": { borderColor: "#8b949e" },
                  "&.Mui-focused fieldset": { borderColor: "#58a6ff" },
                },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />

            <TextField
              fullWidth
              label="Location"
              placeholder="e.g. San Francisco, CA"
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#f0f6fc",
                  "& fieldset": { borderColor: "#30363d" },
                  "&:hover fieldset": { borderColor: "#8b949e" },
                  "&.Mui-focused fieldset": { borderColor: "#58a6ff" },
                },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />

            <TextField
              fullWidth
              label="Website"
              placeholder="https://yourportfolio.com"
              variant="outlined"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  color: "#f0f6fc",
                  "& fieldset": { borderColor: "#30363d" },
                  "&:hover fieldset": { borderColor: "#8b949e" },
                  "&.Mui-focused fieldset": { borderColor: "#58a6ff" },
                },
                "& .MuiInputLabel-root": { color: "#8b949e" },
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{
                  backgroundColor: "#238636",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { backgroundColor: "#2ea043" },
                }}
              >
                {saving ? "Updating..." : "Update profile"}
              </Button>
              <Button
                onClick={() => navigate("/profile")}
                sx={{
                  color: "#8b949e",
                  textTransform: "none",
                  "&:hover": { color: "#f0f6fc" },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
