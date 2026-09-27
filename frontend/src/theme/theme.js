import { createTheme, alpha } from "@mui/material/styles";

// Same tokens as the landing page and index.css
const c = {
  black: "#000000",
  card: "#0D0D0D",
  raised: "#161616",
  ink: "#F4F1EA",
  muted: "#A8A399",
  line: "#2A2A2A",
  blue: "#3341FF",
  blueLight: "#8C96FF", // readable blue for text/links on black
  mint: "#3DDC97",
  pink: "#FF7AB8",
  violet: "#7C3AED",
};

const hard = (px, color) => `${px}px ${px}px 0 ${color}`;

const ui = "'General Sans', -apple-system, sans-serif";
const display = "'Sharpie', sans-serif";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: c.blue, light: c.blueLight, contrastText: "#fff" },
    secondary: { main: c.pink, contrastText: "#000" },
    success: { main: c.mint, contrastText: "#000" },
    info: { main: c.blueLight, contrastText: "#000" },
    warning: { main: "#FF9F43", contrastText: "#000" },
    error: { main: "#FF5C6C", contrastText: "#000" },
    background: { default: c.black, paper: c.card },
    text: { primary: c.ink, secondary: c.muted },
    divider: c.line,
  },
  typography: {
    fontFamily: ui,
    // Sharpie is a display face: keep it to the two biggest headings
    h1: { fontFamily: display, fontWeight: 700 },
    h2: { fontFamily: display, fontWeight: 700 },
    h3: { fontFamily: ui, fontWeight: 600 },
    h4: { fontFamily: ui, fontWeight: 600 },
    h5: { fontFamily: ui, fontWeight: 600 },
    h6: { fontFamily: ui, fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: c.black },
        "::selection": { backgroundColor: c.blue, color: "#fff" },
      },
    },

    // Buttons: ink border + hard shadow that presses in on hover
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "transform .1s, box-shadow .1s, background-color .15s",
        },
        contained: {
          border: `2px solid ${c.ink}`,
          boxShadow: hard(3, c.ink),
          "&:hover": {
            transform: "translate(2px, 2px)",
            boxShadow: hard(1, c.ink),
          },
          "&.Mui-disabled": { boxShadow: "none", borderColor: c.line },
        },
        outlined: {
          borderWidth: 2,
          borderColor: c.ink,
          color: c.ink,
          "&:hover": {
            borderWidth: 2,
            borderColor: c.ink,
            backgroundColor: c.raised,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { "&:hover": { backgroundColor: c.raised } } },
    },

    // Surfaces: Card is the "loud" container, outlined Paper is the flat one for dense lists
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { border: `2px solid ${c.line}` },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `2px solid ${c.ink}`,
          boxShadow: hard(4, c.blue),
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: {
          backgroundColor: c.black,
          backgroundImage: "none",
          borderBottom: `2px solid ${c.ink}`,
          boxShadow: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `2px solid ${c.ink}`,
          boxShadow: hard(6, c.pink),
          backgroundImage: "none",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: `2px solid ${c.ink}`,
          boxShadow: hard(4, c.violet),
          backgroundColor: c.card,
          backgroundImage: "none",
        },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: c.line } } },

    // Inputs
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: c.card,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(c.ink, 0.35),
            borderWidth: 2,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.ink },
          "&.Mui-focused": { boxShadow: hard(3, c.blue) },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: c.ink,
            borderWidth: 2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { "&.Mui-focused": { color: c.ink } } },
    },

    // Small stuff
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 600 },
        outlined: { borderWidth: 2, borderColor: alpha(c.ink, 0.5) },
      },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 3, backgroundColor: c.ink } },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: c.ink,
          color: "#000",
          fontWeight: 600,
          borderRadius: 6,
        },
        arrow: { color: c.ink },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: { root: { color: c.blueLight, fontWeight: 500 } },
    },
    MuiAvatar: { styleOverrides: { root: { border: `2px solid ${c.ink}` } } },
    MuiListItemButton: {
      styleOverrides: {
        root: { "&:hover, &.Mui-selected": { backgroundColor: c.raised } },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${c.line}` },
        head: { fontWeight: 600, color: c.muted },
      },
    },
    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: alpha(c.ink, 0.08) } },
    },
    MuiAlert: {
      styleOverrides: { root: { border: "2px solid currentColor" } },
    },
  },
});

export default theme;
