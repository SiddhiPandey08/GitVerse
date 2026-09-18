import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        color: "#f0f6fc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: "96px", fontWeight: 700, color: "#8b949e" }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        This is not the web page you are looking for.
      </Typography>
      <Typography sx={{ color: "#8b949e", mb: 4, maxWidth: "480px" }}>
        The requested URL was not found on this server. Check your link or head
        back home.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          backgroundColor: "#238636",
          color: "white",
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          "&:hover": { backgroundColor: "#2ea043" },
        }}
      >
        Return to Dashboard
      </Button>
    </Box>
  );
}
