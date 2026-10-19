import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext.jsx";
import { Snackbar } from "@mui/material";
import { useLocation } from "react-router-dom";
import LogoMarquee from "../components/LogoMarquee";
import "../App.css";

const meridianTheme = createTheme({
  palette: {
    primary: { main: "#c25b41" },
    secondary: { main: "#d9a441" },
  },
  typography: {
    fontFamily: "var(--font-body)",
  },
});

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    fontFamily: "var(--font-body)",
    "& fieldset": { borderColor: "var(--cream-dim)" },
    "&:hover fieldset": { borderColor: "var(--rust)" },
    "&.Mui-focused fieldset": { borderColor: "var(--rust)" },
  },
  "& .MuiInputLabel-root": { color: "var(--ink-soft)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--rust)" },
};

export default function Authentication() {
  const location = useLocation();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(
    location.state?.formState ?? 0,
  );
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setUsername("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
      }
    } catch (err) {
      let msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={meridianTheme}>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CssBaseline />

        {/* Left panel — brand side */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            background: "var(--navy)",
            overflow: "hidden",
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogoMarquee />
          <Box
            sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 4 }}
          >
            <div
              style={{
                display: "inline-block",
                background: "var(--cream)",
                borderRadius: "16px",
                padding: "1rem 1.5rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <img
                src="/meridianLogo.png"
                alt="Meridian"
                style={{ width: "180px", display: "block" }}
              />
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--cream)",
                fontSize: "1.4rem",
                marginTop: "1.5rem",
                maxWidth: "380px",
                marginInline: "auto",
              }}
            >
              Close the distance, in real time.
            </p>
          </Box>
        </Box>

        {/* Right panel — auth form */}
        <Box
          component={Paper}
          elevation={0}
          square
          sx={{ flex: 1, overflowY: "auto" }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: "var(--font-body)",
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: "var(--mustard)",
                color: "var(--navy-dark)",
              }}
            >
              <LockOutlinedIcon />
            </Avatar>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--ink)",
                margin: "0.5rem 0 1rem",
              }}
            >
              {formState === 0 ? "Welcome back" : "Create an account"}
            </h2>

            <div
              style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
            >
              <Button
                onClick={() => setFormState(0)}
                sx={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  textTransform: "none",
                  color: formState === 0 ? "white" : "var(--ink-soft)",
                  background: formState === 0 ? "var(--rust)" : "transparent",
                  borderRadius: "8px",
                  "&:hover": {
                    background:
                      formState === 0 ? "var(--rust-dark)" : "var(--cream-dim)",
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                onClick={() => setFormState(1)}
                sx={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  textTransform: "none",
                  color: formState === 1 ? "white" : "var(--ink-soft)",
                  background: formState === 1 ? "var(--rust)" : "transparent",
                  borderRadius: "8px",
                  "&:hover": {
                    background:
                      formState === 1 ? "var(--rust-dark)" : "var(--cream-dim)",
                  },
                }}
              >
                Sign Up
              </Button>
            </div>

            <Box
              component="form"
              noValidate
              sx={{ mt: 1, width: "100%", maxWidth: 360 }}
            >
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Full Name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  sx={fieldStyles}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={fieldStyles}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                sx={fieldStyles}
              />

              {error && (
                <p
                  style={{
                    color: "var(--rust)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                  }}
                >
                  {error}
                </p>
              )}

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  background: "var(--rust)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "10px",
                  paddingBlock: "0.8rem",
                  "&:hover": { background: "var(--rust-dark)" },
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar open={open} autoHideDuration={4000} message={message} />
    </ThemeProvider>
  );
}
