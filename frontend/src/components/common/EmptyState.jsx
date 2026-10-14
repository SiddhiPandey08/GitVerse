import { Box, Typography } from "@mui/material";

export default function EmptyState({ message }) {
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography color="text.secondary">{message}</Typography>
    </Box>
  );
}
