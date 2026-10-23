import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import "../App.css";
import { useToast } from "../contexts/ToastContext";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        showToast(
          "Couldn't load your meeting history. Try again.",
          error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="historyPageContainer">
      <div className="historyContent">
        <h2>
          Your <span className="accent">meeting history</span>
        </h2>
        <p className="tagline">Every call you've joined, in one place.</p>

        {loading ? (
          <p className="historyStatus">Loading…</p>
        ) : meetings.length === 0 ? (
          <div className="historyEmpty">
            <EventBusyIcon
              sx={{ fontSize: "2.5rem", color: "var(--dust-blue)" }}
            />
            <h3>No meetings yet</h3>
            <p>Join or start a call and it'll show up here.</p>
            <Button
              onClick={() => navigate("/home")}
              variant="contained"
              sx={{
                background: "var(--rust)",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: "10px",
                marginTop: "1rem",
                "&:hover": { background: "var(--rust-dark)" },
              }}
            >
              Go to Home
            </Button>
          </div>
        ) : (
          <div className="historyGrid">
            {meetings.map((e, i) => (
              <div className="historyCard" key={i}>
                <div className="historyCardTop">
                  <span className="historyCode">{e.meetingCode}</span>
                  <span className="historyDate">{formatDate(e.date)}</span>
                </div>
                <Button
                  onClick={() => navigate(`/${e.meetingCode}`)}
                  fullWidth
                  sx={{
                    background: "var(--cream-dim)",
                    color: "var(--ink)",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    marginTop: "0.8rem",
                    "&:hover": { background: "var(--sage)", color: "white" },
                  }}
                >
                  Rejoin
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
