import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  InputBase,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../../authContext";

export default function Navbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currUser, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Top navigation links
  const navLinks = [
    { label: "Dashboard", path: "/" },
    { label: "Repositories", path: "/repositories" },
    { label: "Starred", path: "/starredRepo" },
  ];

  const handleLogout = () => {
    setAnchorEl(null);
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      navigate("/auth");
    }
  };

  const userInitial = currUser?.username
    ? currUser.username.charAt(0).toUpperCase()
    : "S";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#161b22",
        borderBottom: "1px solid #30363d",
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: "64px" }}>
        {/* Mobile Menu Icon */}
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ color: "#f0f6fc" }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <svg
            height="32"
            viewBox="0 0 16 16"
            width="32"
            fill="#f0f6fc"
            style={{ display: "block" }}
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "18px",
              color: "#f0f6fc",
              letterSpacing: "-0.5px",
            }}
          >
            GitVerse
          </Typography>
        </Box>

        {/* Desktop Links */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
            {navLinks.map((item) => (
              <Button
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  color: "#c9d1d9",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  px: 1.5,
                  "&:hover": {
                    color: "#f0f6fc",
                    backgroundColor: "rgba(177,186,196,0.12)",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Search Input */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0d1117",
              border: "1px solid #30363d",
              borderRadius: "6px",
              px: 1.5,
              py: 0.5,
              width: "240px",
              "&:focus-within": {
                borderColor: "#58a6ff",
                boxShadow: "0 0 0 3px rgba(56,139,253,0.3)",
              },
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: "#8b949e", mr: 1 }} />
            <InputBase
              placeholder="Type '/' to search"
              sx={{
                fontSize: "13px",
                color: "#f0f6fc",
                width: "100%",
                "& input::placeholder": {
                  color: "#8b949e",
                  opacity: 1,
                },
              }}
            />
          </Box>
        )}

        {/* Notifications */}
        <IconButton sx={{ color: "#c9d1d9", "&:hover": { color: "#f0f6fc" } }}>
          <NotificationsIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* New Repo Button (Redirects to /createRepo) */}
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/create-new-repo")}
            sx={{
              backgroundColor: "#238636",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "none",
              boxShadow: "none",
              px: 1.5,
              py: 0.5,
              borderRadius: "6px",
              "&:hover": {
                backgroundColor: "#2ea043",
                boxShadow: "none",
              },
            }}
          >
            New
          </Button>
        )}

        {/* Profile Menu Avatar */}
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ p: 0.5 }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              backgroundColor: "#21262d",
              border: "1px solid #30363d",
              fontSize: "14px",
              color: "#f0f6fc",
              fontWeight: 600,
            }}
          >
            {userInitial}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              backgroundColor: "#161b22",
              border: "1px solid #30363d",
              color: "#f0f6fc",
              minWidth: "160px",
              mt: 1,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/profile");
            }}
            sx={{
              fontSize: "14px",
              "&:hover": { backgroundColor: "#21262d" },
            }}
          >
            Your profile
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            sx={{
              fontSize: "14px",
              color: "#f85149",
              "&:hover": { backgroundColor: "#21262d" },
            }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { backgroundColor: "#161b22", width: 240, color: "#f0f6fc" },
        }}
      >
        <List sx={{ mt: 2 }}>
          {navLinks.map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => {
                setDrawerOpen(false);
                navigate(item.path);
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}
