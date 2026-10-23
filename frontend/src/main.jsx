import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AuthProvider } from "./authContext.jsx";
import ProjectRoutes from "./Routes.jsx";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./features/meeting/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />

    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <ProjectRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>,
);
