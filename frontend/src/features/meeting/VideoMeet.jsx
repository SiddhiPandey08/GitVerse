import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { TextField, Button, IconButton, Badge } from "@mui/material";

import styles from "./videoComponent.module.css";
import "./meetingTheme.css";
import client from "../../api/client";
import { useToast } from "./ToastContext";
import InitialsAvatar from "./InitialsAvatar";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import PeopleIcon from "@mui/icons-material/People";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS & MODULE-LEVEL STATE
   ═══════════════════════════════════════════════════════════════════════════ */

const server_url = import.meta.env.VITE_API_URL || "http://localhost:3000";

const peerConfigConnection = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// socketId -> RTCPeerConnection (lives outside React on purpose)
var connections = {};

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES (no dependency on component state)
   ═══════════════════════════════════════════════════════════════════════════ */

// A silent, disabled audio track
const silence = () => {
  let ctx = new AudioContext();
  let dst = ctx.createMediaStreamDestination();
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
};

// A black, disabled video track
const black = ({ width = 640, height = 480 } = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], { enabled: false });
};

// A placeholder stream used when camera/mic are off or unavailable
const createBlackSilenceStream = (...args) =>
  new MediaStream([black(...args), silence()]);

// Stops every track of a stream, ignoring errors
const stopAllTracks = (stream) => {
  try {
    stream.getTracks().forEach((track) => track.stop());
  } catch (e) {}
};

/* ═══════════════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SMALL PRESENTATIONAL COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function LocalVideo({
  stream,
  className,
  registerRef,
  muted = true,
  autoPlay = true,
  playsInline = true,
}) {
  const videoElementRef = useRef(null);

  useEffect(() => {
    if (videoElementRef.current) {
      videoElementRef.current.srcObject = stream || null;
      registerRef?.(videoElementRef.current);
    }
  }, [stream, registerRef]);

  return (
    <video
      ref={videoElementRef}
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
      className={className}
    ></video>
  );
}

function MutedMicIcon({ sx }) {
  return <MicOffIcon sx={sx} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function VideoMeetComponent() {
  // ─── Refs ────────────────────────────────────────────────────────────────
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const videoRef = useRef([]);
  const chatEndRef = useRef(null);

  // ─── Router ──────────────────────────────────────────────────────────────
  const { url } = useParams();
  const navigate = useNavigate();

  // ─── Toast ───────────────────────────────────────────────────────────────
  const { showToast } = useToast();

  // ─── State: devices & media ──────────────────────────────────────────────
  const canShareScreen = !!navigator.mediaDevices?.getDisplayMedia;
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(canShareScreen);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();

  // ─── State: participants ─────────────────────────────────────────────────
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);
  // socketId -> { username, audio, video }
  let [participantInfo, setParticipantInfo] = useState({});

  // ─── State: chat ─────────────────────────────────────────────────────────
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [chatOpen, setChatOpen] = useState(false);

  // ─── State: layout ───────────────────────────────────────────────────────
  // spotlightId: which remote video is the main speaker (null = show local)
  let [spotlightId, setSpotlightId] = useState(null);
  // screenView: when screen sharing is active, toggle between 'screen' and 'camera'
  let [screenView, setScreenView] = useState("screen");
  let [viewMode, setViewMode] = useState("spotlight"); // "spotlight" | "grid"
  let [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isGridView = isMobile || viewMode === "grid";

  const registerLocalVideoRef = useCallback((node) => {
    if (node) localVideoref.current = node;
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 1 — PERMISSIONS (runs on mount)
  // ═════════════════════════════════════════════════════════════════════════

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      setScreenAvailable(canShareScreen);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log(error);
      showToast("Camera or microphone access was denied.", "error");
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    client
      .get("/meetings/me")
      .then((res) => setUsername(res.data.username))
      .catch(() => {});
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 2 — JOINING THE CALL
  // ═════════════════════════════════════════════════════════════════════════

  const connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 3 — WEBRTC HELPERS (offers / local stream swapping)
  // ═════════════════════════════════════════════════════════════════════════

  // Create an SDP offer for one peer and send it through the socket
  const sendOffer = (id) => {
    connections[id].createOffer().then((description) => {
      connections[id]
        .setLocalDescription(description)
        .then(() => {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections[id].localDescription }),
          );
        })
        .catch((e) => console.log(e));
    });
  };

  // Add the current local stream to every peer and renegotiate
  const shareLocalStreamWithPeers = ({ skipSelf }) => {
    for (let id in connections) {
      if (skipSelf && id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      sendOffer(id);
    }
  };

  // Replace local stream with a black/silent placeholder and show it locally
  const resetToBlackSilenceStream = () => {
    window.localStream = createBlackSilenceStream();
    localVideoref.current.srcObject = window.localStream;
  };

  // ─── Camera / mic stream ─────────────────────────────────────────────────
  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    shareLocalStreamWithPeers({ skipSelf: true });

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          resetToBlackSilenceStream();
          shareLocalStreamWithPeers({ skipSelf: false });
        }),
    );
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  // ─── Screen share ────────────────────────────────────────────────────────
  const getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    shareLocalStreamWithPeers({ skipSelf: true });

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);
          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }
          resetToBlackSilenceStream();
          getUserMedia();
        }),
    );
  };

  const getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) getDislayMedia();
  }, [screen]);

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 4 — SOCKET SERVER & SIGNALING
  // ═════════════════════════════════════════════════════════════════════════

  // Handle incoming WebRTC signals (SDP + ICE)
  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId].setLocalDescription(description).then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      }),
                    );
                  });
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      // ICE must be outside the sdp block
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  // Create a peer connection for one remote client and wire up its events
  const createPeerConnection = (socketListId) => {
    connections[socketListId] = new RTCPeerConnection(peerConfigConnection);

    connections[socketListId].onicecandidate = function (event) {
      if (event.candidate != null) {
        socketRef.current.emit(
          "signal",
          socketListId,
          JSON.stringify({ ice: event.candidate }),
        );
      }
    };

    connections[socketListId].onaddstream = (event) => {
      let videoExists = videoRef.current.find(
        (video) => video.socketId === socketListId,
      );
      if (videoExists) {
        setVideos((videos) => {
          const updatedVideos = videos.map((video) =>
            video.socketId === socketListId
              ? { ...video, stream: event.stream }
              : video,
          );
          videoRef.current = updatedVideos;
          return updatedVideos;
        });
      } else {
        let newVideo = {
          socketId: socketListId,
          stream: event.stream,
          autoplay: true,
          playsinline: true,
        };
        setVideos((videos) => {
          const updatedVideos = [...videos, newVideo];
          videoRef.current = updatedVideos;
          if (updatedVideos.length === 1) setSpotlightId(socketListId);
          return updatedVideos;
        });
      }
    };

    if (window.localStream !== undefined && window.localStream !== null) {
      connections[socketListId].addStream(window.localStream);
    } else {
      window.localStream = createBlackSilenceStream();
      connections[socketListId].addStream(window.localStream);
    }
  };

  // Someone joined (or we joined): set up peers, and if it's us, send offers
  const handleUserJoined = (id, clients) => {
    console.log("clients received:", clients);

    const infoMap = {};
    clients.forEach(({ socketId: socketListId, username: u, audio, video }) => {
      infoMap[socketListId] = { username: u, audio, video };
      createPeerConnection(socketListId);
    });
    setParticipantInfo((prev) => ({ ...prev, ...infoMap }));

    if (id === socketIdRef.current) {
      for (let id2 in connections) {
        if (id2 === socketIdRef.current) continue;
        try {
          connections[id2].addStream(window.localStream);
        } catch (e) {}
        sendOffer(id2);
      }
    }
  };

  const handleUserLeft = (id) => {
    setVideos((videos) => videos.filter((video) => video.socketId !== id));
    setSpotlightId((prev) => (prev === id ? null : prev));
  };

  const connectToSocketServer = () => {
    socketRef.current = io(server_url, {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href, username);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", handleUserLeft);
      socketRef.current.on("user-joined", handleUserJoined);
    });

    socketRef.current.on("media-status", (id, audio, video) => {
      setParticipantInfo((prev) => ({
        ...prev,
        [id]: { ...prev[id], audio, video },
      }));
    });

    socketRef.current.on("disconnect", () => {
      showToast("Connection lost. Trying to reconnect…", "error");
    });
  };

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 5 — CONTROLS
  // ═════════════════════════════════════════════════════════════════════════

  const handleVideo = () => {
    const next = !video;
    setVideo(next);
    socketRef.current?.emit("media-status", audio, next);
  };

  const handleAudio = () => {
    const next = !audio;
    setAudio(next);
    socketRef.current?.emit("media-status", next, video);
  };

  const handleScreen = () => {
    if (screen) setScreenView("screen"); // reset on stop
    setScreen(!screen);
  };

  const handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    socketRef.current?.disconnect();
    window.location.href = "/dashboard";
  };

  const toggleViewMode = () =>
    setViewMode((v) => (v === "spotlight" ? "grid" : "spotlight"));

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Meeting link copied!", "success");
  };

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 6 — CHAT
  // ═════════════════════════════════════════════════════════════════════════

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  const toggleChat = () => {
    setChatOpen((prev) => {
      if (!prev) setNewMessages(0);
      return !prev;
    });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const handleMessageKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 7 — DERIVED VALUES & RENDER HELPERS
  // ═════════════════════════════════════════════════════════════════════════

  const spotlightVideo = videos.find((v) => v.socketId === spotlightId);
  const stripVideos = videos.filter((v) => v.socketId !== spotlightId);

  // Name shown for a remote participant
  const getRemoteName = (socketId) =>
    participantInfo[socketId]?.username || socketId.slice(0, 8);

  // Ref callbacks that attach a stream to a <video> element
  const attachRemoteStream = (stream) => (ref) => {
    if (ref && stream) ref.srcObject = stream;
  };
  const attachLocalStream = (ref) => {
    if (ref && window.localStream) ref.srcObject = window.localStream;
  };

  // Remote <video> or an avatar when their camera is off
  const renderRemoteTile = (v, avatarSize) => {
    if (participantInfo[v.socketId]?.video === false) {
      return (
        <div className={styles.avatarFallback}>
          <InitialsAvatar
            name={participantInfo[v.socketId]?.username}
            size={avatarSize}
          />
        </div>
      );
    }
    return <video autoPlay playsInline ref={attachRemoteStream(v.stream)}></video>;
  };

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 8 — JSX: LOBBY
  // ═════════════════════════════════════════════════════════════════════════

  const renderLobby = () => (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        <div className={styles.lobbyBrand}>
          <img
            style={{ width: "50%", height: "5rem" }}
            src="/meridianLogo.png"
            alt="Meridian"
            className="logo"
          />
        </div>
        <p className={styles.lobbySubtitle}>Ready to join the call?</p>

        <div className={styles.lobbyPreview}>
          <LocalVideo
            stream={window.localStream}
            className={styles.lobbyVideo}
            registerRef={registerLocalVideoRef}
          />
          <div className={styles.lobbyVideoLabel}>Preview</div>
        </div>

        <TextField
          fullWidth
          label="Your name"
          slotProps={{ input: { readOnly: true } }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && connect()}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "var(--cream)",
              "& fieldset": { borderColor: "var(--dust-blue)" },
              "&:hover fieldset": { borderColor: "var(--mustard)" },
              "&.Mui-focused fieldset": { borderColor: "var(--mustard)" },
            },
            "& .MuiInputLabel-root": { color: "var(--dust-blue)" },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "var(--mustard)",
            },
          }}
        />

        <Button
          fullWidth
          onClick={copyMeetingLink}
          startIcon={<ContentCopyIcon />}
          sx={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            textTransform: "none",
            color: "var(--rust)",
            marginTop: "0.5rem",
          }}
        >
          Copy meeting link
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={connect}
          sx={{
            background: "var(--mustard)",
            color: "var(--navy-dark)",
            fontWeight: 700,
            fontSize: "1rem",
            padding: "12px",
            borderRadius: "10px",
            textTransform: "none",
            marginTop: "8px",
            "&:hover": { background: "var(--sage)" },
          }}
        >
          Join Call
        </Button>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 9 — JSX: CHAT PANEL
  // ═════════════════════════════════════════════════════════════════════════

  const renderChatPanel = () => (
    <>
      <div className={styles.chatBackdrop} onClick={toggleChat}></div>
      <div className={styles.chatPanel}>
        <div className={styles.chatDragHandle}></div>

        <div className={styles.sidePanelHeader}>
          <span>Chat</span>
          <button className={styles.panelClose} onClick={toggleChat}>
            ✕
          </button>
        </div>

        <div className={styles.chattingDisplay}>
          {messages.length === 0 ? (
            <p className={styles.noMessages}>No messages yet</p>
          ) : (
            messages.map((item, index) => (
              <div
                key={index}
                className={`${styles.messageBubble} ${item.sender === username ? styles.myMessage : styles.theirMessage}`}
              >
                <span className={styles.messageSender}>{item.sender}</span>
                <p className={styles.messageText}>{item.data}</p>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className={styles.chattingArea}>
          <TextField
            fullWidth
            size="small"
            placeholder="Message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleMessageKey}
            multiline
            maxRows={4}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#e8eaf6",
                background: "#0d1b3e",
                "& fieldset": { borderColor: "#1e3a6e" },
                "&:hover fieldset": { borderColor: "#F4B942" },
                "&.Mui-focused fieldset": { borderColor: "#F4B942" },
              },
              "& .MuiInputBase-input::placeholder": { color: "#8892b0" },
            }}
          />
          <p className={styles.chatHint}>Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 10 — JSX: GRID VIEW
  // ═════════════════════════════════════════════════════════════════════════

  const renderGridView = () => (
    <div className={styles.gridArea}>
      <div className={styles.gridContainer}>
        {/* Local tile (desktop only; on mobile we use the PiP below) */}
        {!isMobile && (
          <div className={styles.gridTile}>
            {!video ? (
              <div className={styles.avatarFallback}>
                <InitialsAvatar name={username} size={56} />
              </div>
            ) : (
              <LocalVideo
                stream={window.localStream}
                registerRef={registerLocalVideoRef}
              />
            )}
            <div className={`${styles.gridLabel} ${styles.participantLabel}`}>
              {username || "You"}
              {!audio && (
                <MutedMicIcon sx={{ fontSize: "0.8rem", marginLeft: "0.3rem" }} />
              )}
            </div>
          </div>
        )}

        {/* Remote tiles */}
        {videos.map((v) => (
          <div className={styles.gridTile} key={v.socketId}>
            {renderRemoteTile(v, 56)}
            <div className={`${styles.gridLabel} ${styles.participantLabel}`}>
              {getRemoteName(v.socketId)}
              {participantInfo[v.socketId]?.audio === false && (
                <MutedMicIcon sx={{ fontSize: "0.8rem", marginLeft: "0.3rem" }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: local video as picture-in-picture */}
      {isMobile && (
        <div className={styles.pipWrapper}>
          {!video ? (
            <div className={styles.avatarFallback}>
              <InitialsAvatar name={username} size={40} />
            </div>
          ) : (
            <LocalVideo
              stream={window.localStream}
              className={styles.pipVideo}
              registerRef={registerLocalVideoRef}
            />
          )}
          <div className={`${styles.pipLabel} ${styles.participantLabel}`}>
            {username || "You"}
          </div>
        </div>
      )}
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 11 — JSX: SPOTLIGHT VIEW (main speaker + participants strip)
  // ═════════════════════════════════════════════════════════════════════════

  // Screen / Camera switch, only shown while sharing
  const renderScreenViewToggle = () => (
    <div className={styles.viewToggle}>
      <button
        className={`${styles.viewToggleBtn} ${screenView === "screen" ? styles.viewToggleActive : ""}`}
        onClick={() => setScreenView("screen")}
      >
        <ScreenShareIcon style={{ fontSize: "0.85rem" }} /> Screen
      </button>
      <button
        className={`${styles.viewToggleBtn} ${screenView === "camera" ? styles.viewToggleActive : ""}`}
        onClick={() => setScreenView("camera")}
      >
        <VideocamIcon style={{ fontSize: "0.85rem" }} /> Camera
      </button>
    </div>
  );

  // Big card when a remote participant is in the spotlight
  const renderRemoteSpotlight = () => (
    <div className={styles.spotlightCard}>
      {participantInfo[spotlightVideo.socketId]?.video === false ? (
        <div className={styles.avatarFallback}>
          <InitialsAvatar name={participantInfo[spotlightVideo.socketId]?.username} />
        </div>
      ) : (
        <video
          autoPlay
          playsInline
          ref={attachRemoteStream(spotlightVideo.stream)}
        ></video>
      )}
      <div className={`${styles.spotlightLabel} ${styles.participantLabel}`}>
        {getRemoteName(spotlightVideo.socketId)}
        {participantInfo[spotlightVideo.socketId]?.audio === false && (
          <MutedMicIcon
            sx={{
              fontSize: "0.9rem",
              marginLeft: "0.4rem",
              verticalAlign: "middle",
            }}
          />
        )}
      </div>
    </div>
  );

  // Big card when *we* are in the spotlight (screen share, avatar or camera)
  const renderLocalSpotlight = () => (
    <div className={styles.spotlightCard}>
      {screen && screenView === "screen" ? (
        <video autoPlay muted ref={attachLocalStream}></video>
      ) : !video ? (
        <div className={styles.avatarFallback}>
          <InitialsAvatar name={username} />
        </div>
      ) : (
        <LocalVideo stream={window.localStream} registerRef={registerLocalVideoRef} />
      )}
      <div className={`${styles.spotlightLabel} ${styles.participantLabel}`}>
        {username || "You"}
      </div>
    </div>
  );

  // Our own small preview, shown while a remote user is spotlighted
  const renderLocalPip = () => (
    <div className={styles.pipWrapper}>
      <LocalVideo
        stream={window.localStream}
        className={styles.pipVideo}
        registerRef={registerLocalVideoRef}
      />
      <div className={`${styles.pipLabel} ${styles.participantLabel}`}>
        {username || "You"}
      </div>
    </div>
  );

  // Right-hand list of everyone in the call
  const renderParticipantStrip = () => (
    <div className={styles.participantStrip}>
      <div className={styles.stripHeader}>
        <PeopleIcon style={{ fontSize: "0.9rem", color: "#5f6b4f" }} />
        <span>{videos.length + 1} in call</span>
      </div>

      <div className={styles.stripList}>
        {/* Local card */}
        <div
          className={`${styles.stripCard} ${!spotlightVideo ? styles.stripCardActive : ""}`}
          onClick={() => setSpotlightId(null)}
        >
          {!video ? (
            <div className={styles.avatarFallback}>
              <InitialsAvatar name={username} size={40} />
            </div>
          ) : (
            <video autoPlay muted ref={attachLocalStream}></video>
          )}
          <div className={`${styles.stripLabel} ${styles.participantLabel}`}>
            {username || "You"}
          </div>
        </div>

        {/* Remote cards */}
        {videos.map((v) => (
          <div
            key={v.socketId}
            className={`${styles.stripCard} ${spotlightId === v.socketId ? styles.stripCardActive : ""}`}
            onClick={() => setSpotlightId(v.socketId)}
          >
            {renderRemoteTile(v, 40)}
            <div className={`${styles.stripLabel} ${styles.participantLabel}`}>
              {getRemoteName(v.socketId)}
              {participantInfo[v.socketId]?.audio === false && (
                <MutedMicIcon
                  sx={{
                    fontSize: "0.7rem",
                    marginLeft: "0.3rem",
                    verticalAlign: "middle",
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpotlightView = () => (
    <>
      {/* CENTER: Spotlight speaker */}
      <div className={styles.spotlightArea}>
        {screen && renderScreenViewToggle()}
        {spotlightVideo ? renderRemoteSpotlight() : renderLocalSpotlight()}
        {spotlightVideo && renderLocalPip()}
      </div>

      {/* RIGHT: Participants strip */}
      {renderParticipantStrip()}
    </>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 12 — JSX: CONTROL BAR
  // ═════════════════════════════════════════════════════════════════════════

  const renderMobileControls = () => (
    <>
      <div className={styles.controlBtn}>
        <IconButton
          aria-label={video ? "Turn camera off" : "Turn camera on"}
          onClick={handleVideo}
          className={`${styles.iconBtn} ${!video ? styles.iconBtnOff : ""}`}
        >
          {video ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
      </div>

      <div className={styles.controlBtn}>
        <IconButton
          aria-label={audio ? "Mute microphone" : "Unmute microphone"}
          onClick={handleAudio}
          className={`${styles.iconBtn} ${!audio ? styles.iconBtnOff : ""}`}
        >
          {audio ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
      </div>

      <div className={styles.controlBtn}>
        <Badge badgeContent={newMessages || null} color="warning">
          <IconButton
            aria-label={chatOpen ? "Close chat" : "Open chat"}
            onClick={toggleChat}
            className={`${styles.iconBtn} ${chatOpen ? styles.iconBtnActive : ""}`}
          >
            <ChatIcon />
          </IconButton>
        </Badge>
      </div>

      {/* "More" menu: view mode + screen share */}
      <div className={styles.controlBtn}>
        <IconButton
          aria-label="More options"
          onClick={() => setMoreMenuOpen((prev) => !prev)}
          className={`${styles.iconBtn} ${moreMenuOpen ? styles.iconBtnActive : ""}`}
        >
          <MoreHorizIcon />
        </IconButton>
        {moreMenuOpen && (
          <div className={styles.moreMenu}>
            <button
              type="button"
              className={styles.moreMenuItem}
              onClick={() => {
                toggleViewMode();
                setMoreMenuOpen(false);
              }}
            >
              {viewMode === "spotlight"
                ? "Switch to grid view"
                : "Switch to spotlight view"}
            </button>
            {canShareScreen && (
              <button
                type="button"
                className={styles.moreMenuItem}
                onClick={() => {
                  handleScreen();
                  setMoreMenuOpen(false);
                }}
              >
                {screen ? "Stop sharing screen" : "Share screen"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.controlBtn}>
        <IconButton
          aria-label="Leave call"
          onClick={handleEndCall}
          className={styles.iconBtnEnd}
        >
          <CallEndIcon />
        </IconButton>
      </div>
    </>
  );

  const renderDesktopControls = () => (
    <>
      <div className={styles.controlBtn}>
        <IconButton
          onClick={handleVideo}
          className={`${styles.iconBtn} ${!video ? styles.iconBtnOff : ""}`}
        >
          {video ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
        <span>{video ? "Camera" : "Off"}</span>
      </div>

      <div className={styles.controlBtn}>
        <IconButton
          onClick={handleAudio}
          className={`${styles.iconBtn} ${!audio ? styles.iconBtnOff : ""}`}
        >
          {audio ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        <span>{audio ? "Mic" : "Muted"}</span>
      </div>

      <div className={styles.controlBtn}>
        <IconButton
          onClick={toggleViewMode}
          className={`${styles.iconBtn} ${viewMode === "grid" ? styles.iconBtnActive : ""}`}
        >
          {viewMode === "spotlight" ? <GridViewIcon /> : <ViewSidebarIcon />}
        </IconButton>
        <span>{viewMode === "spotlight" ? "Grid" : "Spotlight"}</span>
      </div>

      {screenAvailable && (
        <div className={styles.controlBtn}>
          <IconButton
            onClick={handleScreen}
            className={`${styles.iconBtn} ${screen ? styles.iconBtnActive : ""}`}
          >
            {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
          <span>{screen ? "Stop" : "Share"}</span>
        </div>
      )}

      <div className={styles.controlBtn}>
        <IconButton onClick={handleEndCall} className={styles.iconBtnEnd}>
          <CallEndIcon />
        </IconButton>
        <span>Leave</span>
      </div>

      <div className={styles.controlBtn}>
        <Badge badgeContent={newMessages || null} color="warning">
          <IconButton
            onClick={toggleChat}
            className={`${styles.iconBtn} ${chatOpen ? styles.iconBtnActive : ""}`}
          >
            <ChatIcon />
          </IconButton>
        </Badge>
        <span>Chat</span>
      </div>
    </>
  );

  const renderControlBar = () => (
    <div className={styles.buttonContainers}>
      <div className={styles.controlBar}>
        {isMobile ? renderMobileControls() : renderDesktopControls()}
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 13 — JSX: MEETING ROOM
  // ═════════════════════════════════════════════════════════════════════════

  const renderMeetingRoom = () => (
    <div className={styles.meetVideoContainer}>
      {chatOpen && renderChatPanel()}
      {isGridView ? renderGridView() : renderSpotlightView()}
      {renderControlBar()}
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="meeting-theme">
      {askForUsername === true ? renderLobby() : renderMeetingRoom()}
    </div>
  );
}

export default VideoMeetComponent;
