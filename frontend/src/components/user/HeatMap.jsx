import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import axios from "axios";

export default function HeatMapProfile({ userId }) {
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchActivityData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/activity/${userId}`,
        );
        setActivityData(response.data.activity);
      } catch (error) {
        console.error("Error fetching activity data:", error);
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
  console.log("activityData:", activityData);
  return (
    <HeatMap
      value={activityData}
      startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
      endDate={new Date()}
      panelColors={panelColors}
      width={990}
      style={{ color: "#DFE0C3" }}
    />
  );
}
