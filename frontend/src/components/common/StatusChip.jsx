/**
 * <StatusChip> — semantic status badge.
 *
 * color prop: "success" | "warning" | "danger" | "branch" | "info" | "neutral"
 *
 * Renders as: coloured text on 12%-alpha bg, 1px border at 30%-alpha.
 * Color = meaning only. Never use for decoration.
 *
 * Usage:
 *   <StatusChip color="success">Public</StatusChip>
 *   <StatusChip color="warning">Private</StatusChip>
 *   <StatusChip color="info">main</StatusChip>
 */
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";

const monoStack =
  "'Fira Code', ui-monospace, 'Cascadia Code', Menlo, monospace";

const colorMap = {
  success: "success",
  warning: "warning",
  danger:  "error",
  branch:  "secondary",
  info:    "info",
  neutral: null,
};

export default function StatusChip({ color = "neutral", children, sx, ...props }) {
  const theme = useTheme();

  let mainColor;
  if (color === "neutral") {
    mainColor = theme.palette.text.secondary;
  } else {
    const paletteKey = colorMap[color] || "primary";
    mainColor = theme.palette[paletteKey]?.main ?? theme.palette.primary.main;
  }

  return (
    <Box
      component="span"
      {...props}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontFamily: monoStack,
        fontSize: "0.6875rem",
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: "0.02em",
        color: mainColor,
        backgroundColor: alpha(mainColor, 0.12),
        border: `1px solid ${alpha(mainColor, 0.3)}`,
        borderRadius: "4px",
        padding: "2px 6px",
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
