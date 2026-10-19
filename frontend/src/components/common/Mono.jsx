/**
 * <Mono> — renders technical content in Fira Code.
 * Use for: repo names, owner handles, commit hashes, branch names,
 * file paths, timestamps, counts, CLI commands, kbd chips.
 *
 * Props forwarded to MUI <Typography>.
 *
 * Usage:
 *   <Mono variant="body2" color="text.secondary">abc1234</Mono>
 *   <Mono component="span" sx={{ color: "info.main" }}>main</Mono>
 */
import Typography from "@mui/material/Typography";

const monoStack =
  "'Fira Code', ui-monospace, 'Cascadia Code', Menlo, monospace";

export default function Mono({ children, sx, ...props }) {
  return (
    <Typography
      {...props}
      sx={{ fontFamily: monoStack, ...sx }}
    >
      {children}
    </Typography>
  );
}
