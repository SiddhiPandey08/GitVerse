import { CircularProgress, Box, Typography } from "@mui/material";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", gap: 1.5 }}>
      <CircularProgress size={22} />
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
