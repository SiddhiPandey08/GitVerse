import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import App from "./App.jsx";
import { AuthProvider } from "./authContext.jsx";
import ProjectRoutes from "./Routes.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />

    <AuthProvider>
      <BrowserRouter>
        <ProjectRoutes />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>,
);
