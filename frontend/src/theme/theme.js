import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#58A6FF" }, // Muted GitHub steel blue
    secondary: { main: "#8B949E" },
    success: { main: "#238636" }, // Authentic GitHub Green CTA
    background: {
      default: "#0D1117",
      paper: "#161B22",
    },
    text: {
      primary: "#F0F6FC",
      secondary: "#8B949E",
    },
    divider: "#30363D",
  },
  typography: {
    fontFamily: "'General Sans', sans-serif",
    h1: { fontFamily: "'Sharpie', sans-serif" },
    h2: { fontFamily: "'Sharpie', sans-serif" },
    h3: { fontFamily: "'Sharpie', sans-serif" },
    h4: { fontFamily: "'Sharpie', sans-serif" },
    h5: { fontFamily: "'Sharpie', sans-serif" },
    h6: { fontFamily: "'Sharpie', sans-serif" },
  },
  shape: {
    borderRadius: 6,
  },
});

export default theme;
