import { useState } from "react";

export function CallPreviewCard() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  return (
    <div className="previewCardContainer">
      <div className="previewCardHeader">
        <div className="previewLiveBadge">
          <span className="liveDot"></span> LIVE ROOM DEMO
        </div>
        <div className="previewRoomCode">meridian-789</div>
      </div>

      <div className="previewVideoFrame">
        {videoOn ? (
          <div className="videoFeedPlaceholder">
            <div className="avatarCircle">M</div>
            <p className="participantName">Sarah Jenkins (Host)</p>
          </div>
        ) : (
          <div className="videoOffPlaceholder">
            <p>Camera Off</p>
          </div>
        )}

        {sharing && (
          <div className="screenShareOverlay">
            <span>🖥️ Screen Share Active</span>
          </div>
        )}
      </div>

      <div className="previewControls">
        <button
          type="button"
          className={`controlBtn ${!micOn ? "btnMuted" : ""}`}
          onClick={() => setMicOn((prev) => !prev)}
          title="Toggle Mic"
        >
          {micOn ? "🎤" : "🎙️❌"}
        </button>

        <button
          type="button"
          className={`controlBtn ${!videoOn ? "btnMuted" : ""}`}
          onClick={() => setVideoOn((prev) => !prev)}
          title="Toggle Video"
        >
          {videoOn ? "📹" : "📷❌"}
        </button>

        <button
          type="button"
          className={`controlBtn ${sharing ? "btnActive" : ""}`}
          onClick={() => setSharing((prev) => !prev)}
          title="Toggle Screen Share"
        >
          {sharing ? "📺 Sharing" : "💻 Share"}
        </button>
      </div>
    </div>
  );
}
