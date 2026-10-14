import { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import { getUserActivity } from "../../api/activity";

export default function HeatMapProfile({ userId }) {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchActivityData = async () => {
      try {
        const response = await getUserActivity(userId);
        setActivityData(response.data.activity || []);
      } catch (error) {
        console.error("Error fetching activity data:", error);
        setError("Couldn't load activity. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [userId]);

  const panelColors = {
    0: "#DFE0C3", // spring - no/minimal activity
    2: "#B8D8B0", // soft sage green
    5: "#7FB88F", // medium green
    10: "#4A9463", // deeper green
    15: "#2D6B47", // dark green - very high activity
  };
  if (loading) return <p className="empty-state">Loading activity...</p>;
  if (error) return <p className="empty-state">{error}</p>;
  if (activityData.length === 0) return <p className="empty-state">No activity yet.</p>;

  return (
    <div style={{ overflowX: "auto", maxWidth: "100%" }}>
      <HeatMap
        value={activityData}
        startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
        endDate={new Date()}
        panelColors={panelColors}
        width={990}
        style={{ color: "#DFE0C3", minWidth: 720 }}
      />
    </div>
  );
}
