import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InitialsAvatar from "../components/InitialsAvatar";
import "../App.css";
import History from "./history";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function computeStats(meetings) {
  if (!meetings || meetings.length === 0) {
    return { total: 0, thisMonth: 0, mostActiveDay: "—" };
  }

  const now = new Date();
  const total = meetings.length;

  const thisMonth = meetings.filter((m) => {
    const d = new Date(m.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun..Sat
  meetings.forEach((m) => {
    dayCounts[new Date(m.date).getDay()]++;
  });
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const maxIdx = dayCounts.indexOf(Math.max(...dayCounts));
  const mostActiveDay = total === 0 ? "—" : dayNames[maxIdx];

  return { total, thisMonth, mostActiveDay };
}

function ActivityHeatmap({ meetings }) {
  const DAYS = 119; // ~17 weeks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const counts = {};
  meetings.forEach((m) => {
    const d = new Date(m.date);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  });

  const cells = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: d, count: counts[key] || 0 });
  }

  // pad to a full week grid, Sunday-start
  const leadingBlanks = cells[0].date.getDay();
  const paddedCells = [...Array(leadingBlanks).fill(null), ...cells];
  const weeks = [];
  for (let i = 0; i < paddedCells.length; i += 7) {
    weeks.push(paddedCells.slice(i, i + 7));
  }

  const intensity = (count) => {
    if (count === 0) return "var(--cream-dim)";
    if (count === 1) return "var(--sage)";
    if (count === 2) return "var(--sage-dark)";
    return "var(--rust)";
  };

  return (
    <div className="heatmapWrapper">
      <div className="heatmapGrid">
        {weeks.map((week, wi) => (
          <div className="heatmapColumn" key={wi}>
            {week.map((cell, di) =>
              cell ? (
                <div
                  key={di}
                  className="heatmapCell"
                  style={{ background: intensity(cell.count) }}
                  title={`${cell.date.toDateString()}: ${cell.count} meeting${cell.count === 1 ? "" : "s"}`}
                />
              ) : (
                <div key={di} className="heatmapCell heatmapCellBlank" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="heatmapLegend">
        <span>Less</span>
        <div
          className="heatmapCell"
          style={{ background: "var(--cream-dim)" }}
        />
        <div className="heatmapCell" style={{ background: "var(--sage)" }} />
        <div
          className="heatmapCell"
          style={{ background: "var(--sage-dark)" }}
        />
        <div className="heatmapCell" style={{ background: "var(--rust)" }} />
        <span>More</span>
      </div>
    </div>
  );
}

export default function Profile() {
  const { getHistoryOfUser, getUserInfo } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [profile, setProfile] = useState({
    name: localStorage.getItem("name") || "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        // meetings stay empty, handled by existing empty states
      }

      try {
        const info = await getUserInfo();
        setProfile(info);
      } catch {
        // falls back to localStorage name already in initial state
      }

      setLoading(false);
    };
    load();
  }, []);

  const stats = computeStats(meetings);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="historyPageContainer">
      <div className="navBar">
        <div className="navHeader">
          <img src="/meridianLogo.png" alt="Meridian" className="logo" />
        </div>
        <button className="navPill" onClick={() => navigate("/home")}>
          <HomeIcon sx={{ fontSize: "1.1rem" }} />
          Home
        </button>
      </div>

      <div className="historyContent">
        <div className="profileHeader">
          <InitialsAvatar name={profile.name} size={72} />
          <div>
            <h1>{profile.name || "Your Profile"}</h1>
            {profile.username && (
              <p className="profileUsername">@{profile.username}</p>
            )}
          </div>
        </div>

        <p className="tagline">
          {getGreeting()}, {profile.name?.split(" ")[0] || "there"}.
        </p>

        {!loading && (
          <>
            <div className="statsStrip">
              <div className="statCard">
                <span className="statNumber">{stats.total}</span>
                <span className="statLabel">Total meetings</span>
              </div>
              <div className="statCard">
                <span className="statNumber">{stats.thisMonth}</span>
                <span className="statLabel">This month</span>
              </div>
              <div className="statCard">
                <span className="statNumber">{stats.mostActiveDay}</span>
                <span className="statLabel">Most active day</span>
              </div>
            </div>

            <h3 className="sectionHeading">Activity</h3>
            <ActivityHeatmap meetings={meetings} />

            <History />
          </>
        )}
      </div>
    </div>
  );
}
