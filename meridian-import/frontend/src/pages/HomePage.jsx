import React, { useContext, useState, useRef } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import VideocamIcon from "@mui/icons-material/Videocam";
import { AuthContext } from "../contexts/AuthContext";
import { gsap } from "gsap";
import MarqueeBackground from "../components/MarqueeBackground";
import { useToast } from "../contexts/ToastContext";

function generateMeetingCode() {
  return Math.random().toString(36).slice(2, 8);
}

function QuickStartCard({ onInstantMeeting }) {
  const cardRef = useRef(null);

  const handleEnter = () => {
    gsap.to(cardRef.current, { y: -4, duration: 0.25, ease: "power2.out" });
  };
  const handleLeave = () => {
    gsap.to(cardRef.current, { y: 0, duration: 0.25, ease: "power2.out" });
  };

  return (
    <div
      ref={cardRef}
      className="quickStartCard"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="quickStartIcon">
        <VideocamIcon />
      </div>
      <h3>Start an instant meeting</h3>
      <p>Generate a room and jump in — nothing to schedule.</p>
      <Button
        onClick={onInstantMeeting}
        variant="contained"
        fullWidth
        sx={{
          background: "var(--sage)",
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          textTransform: "none",
          borderRadius: "10px",
          marginTop: "1rem",
          "&:hover": { background: "var(--sage-dark)" },
        }}
      >
        New Meeting
      </Button>
    </div>
  );
}

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  const { showToast } = useToast();

  let handleInstantMeeting = async () => {
    const code = generateMeetingCode();
    await addToUserHistory(code);
    navigator.clipboard.writeText(`${window.location.origin}/${code}`);
    showToast("Meeting created — link copied!", "success");
    navigate(`/${code}`);
  };

  return (
    <div className="homePageContainer">
      <MarqueeBackground />

      <div className="navBar">
        <div className="navHeader">
          <img src="/meridianLogo.png" alt="Meridian" className="logo" />
        </div>

        <div className="navBarActions">
          <button className="navPill" onClick={() => navigate("/profile")}>
            <AccountCircleIcon sx={{ fontSize: "1.1rem" }} />
            My Profile
          </button>

          <button
            className="navPillOutline"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            <LogoutIcon sx={{ fontSize: "1.1rem" }} />
            Logout
          </button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h1>
              Pick up <span className="accent">where you left off</span>
            </h1>
            <p className="tagline">
              Enter a meeting code to jump back in, or check your history for
              past calls.
            </p>

            <div className="joinRow">
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinVideoCall()}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "var(--font-body)",
                    background: "white",
                    "& fieldset": { borderColor: "var(--cream-dim)" },
                    "&:hover fieldset": { borderColor: "var(--rust)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--rust)" },
                  },
                  "& .MuiInputLabel-root": { color: "var(--ink-soft)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "var(--rust)" },
                }}
              />
              <Button
                onClick={handleJoinVideoCall}
                variant="contained"
                sx={{
                  background: "var(--rust)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "10px",
                  paddingInline: "1.6rem",
                  "&:hover": { background: "var(--rust-dark)" },
                }}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <QuickStartCard onInstantMeeting={handleInstantMeeting} />
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);
