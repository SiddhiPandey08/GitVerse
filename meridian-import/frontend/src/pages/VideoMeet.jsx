import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import styles from "../styles/videoComponent.module.css";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ChatIcon from "@mui/icons-material/Chat";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import PeopleIcon from "@mui/icons-material/People";
import server from "../envoirnment";
import { useToast } from "../contexts/ToastContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import InitialsAvatar from "../components/InitialsAvatar";

const server_url = server;
var connections = {};
const peerConfigConnection = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

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

function VideoMeetComponent() {
  // ─── Refs ────────────────────────────────────────────────────────────────
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoref = useRef();
  const videoRef = useRef([]);
  const chatEndRef = useRef(null);

  // ─── Router ──────────────────────────────────────────────────────────────
  const { url } = useParams();
  const navigate = useNavigate();

  // ─── State ───────────────────────────────────────────────────────────────
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  const canShareScreen = !!navigator.mediaDevices?.getDisplayMedia;
  let [screenAvailable, setScreenAvailable] = useState(canShareScreen);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);
  let [chatOpen, setChatOpen] = useState(false);
  // spotlightId: which remote video is the main speaker (null = show local)
  let [spotlightId, setSpotlightId] = useState(null);
  // screenView: when screen sharing is active, toggle between 'screen' and 'camera'
  let [screenView, setScreenView] = useState("screen");
  // socketId -> { username, audio, video }
  let [participantInfo, setParticipantInfo] = useState({});
  let [viewMode, setViewMode] = useState("spotlight"); // "spotlight" | "grid"
  let [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isGridView = isMobile || viewMode === "grid";
  const registerLocalVideoRef = useCallback((node) => {
    if (node) localVideoref.current = node;
  }, []);

  // ─── STEP 1: On mount — ask for camera/mic permissions ───────────────────
  const { showToast } = useToast();

  useEffect(() => {
    getPermissions();
  });

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

  // ─── STEP 2: User clicks Connect ─────────────────────────────────────────
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  // ─── STEP 3: Get local camera/mic stream ─────────────────────────────────
  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let getUserMedia = () => {
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

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
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
    }

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

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
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
          }
        }),
    );
  };

  // ─── STEP 4: Connect to socket server ────────────────────────────────────
  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href, username);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
        setSpotlightId((prev) => (prev === id ? null : prev));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        console.log("clients received:", clients);

        const infoMap = {};
        clients.forEach(
          ({ socketId: socketListId, username: u, audio, video }) => {
            infoMap[socketListId] = { username: u, audio, video };

            connections[socketListId] = new RTCPeerConnection(
              peerConfigConnection,
            );

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

            if (
              window.localStream !== undefined &&
              window.localStream !== null
            ) {
              connections[socketListId].addStream(window.localStream);
            } else {
              let blackSilence = (...args) =>
                new MediaStream([black(...args), silence()]);
              window.localStream = blackSilence();
              connections[socketListId].addStream(window.localStream);
            }
          },
        );
        setParticipantInfo((prev) => ({ ...prev, ...infoMap }));

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
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

  // ─── STEP 5: Handle incoming WebRTC signals (SDP + ICE) ──────────────────
  let gotMessageFromServer = (fromId, message) => {
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
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
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

  // ─── Screen share ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== undefined) getDislayMedia();
  }, [screen]);

  let getDislayMedia = () => {
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

  let getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
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
    }

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
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;
          getUserMedia();
        }),
    );
  };

  // ─── Utility: silence + black stream generators ───────────────────────────
  let silence = () => {
    let ctx = new AudioContext();
    let dst = ctx.createMediaStreamDestination();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // ─── Controls ─────────────────────────────────────────────────────────────
  let handleVideo = () => {
    const next = !video;
    setVideo(next);
    socketRef.current?.emit("media-status", audio, next);
  };

  let handleAudio = () => {
    const next = !audio;
    setAudio(next);
    socketRef.current?.emit("media-status", next, video);
  };
  let handleScreen = () => {
    if (screen) setScreenView("screen"); // reset on stop
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/home";
  };

  let toggleChat = () => {
    setChatOpen((prev) => {
      if (!prev) setNewMessages(0);
      return !prev;
    });
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let handleMessageKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Spotlight helpers ────────────────────────────────────────────────────
  const spotlightVideo = videos.find((v) => v.socketId === spotlightId);
  const stripVideos = videos.filter((v) => v.socketId !== spotlightId);

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {askForUsername === true ? (
        /* ── Lobby ── */
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
            <p className={styles.lobbySubtitle}>
              Enter your name to join the call
            </p>
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
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast("Meeting link copied!", "success");
              }}
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
      ) : (
        /* ── Meeting room ── */
        <div className={styles.meetVideoContainer}>
          {/* LEFT: Chat panel — slides in, takes space */}
          {chatOpen && (
            <div className={styles.chatBackdrop} onClick={toggleChat}></div>
          )}
          {chatOpen && (
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
                      <span className={styles.messageSender}>
                        {item.sender}
                      </span>
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
                <p className={styles.chatHint}>
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </div>
          )}

          {isGridView ? (
            /* CENTER+RIGHT replaced: Grid view */
            <div className={styles.gridArea}>
              <div className={styles.gridContainer}>
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
                    <div
                      className={`${styles.gridLabel} ${styles.participantLabel}`}
                    >
                      {username || "You"}
                      {!audio && (
                        <MicOffIcon
                          sx={{ fontSize: "0.8rem", marginLeft: "0.3rem" }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {videos.map((v) => (
                  <div className={styles.gridTile} key={v.socketId}>
                    {participantInfo[v.socketId]?.video === false ? (
                      <div className={styles.avatarFallback}>
                        <InitialsAvatar
                          name={participantInfo[v.socketId]?.username}
                          size={56}
                        />
                      </div>
                    ) : (
                      <video
                        autoPlay
                        playsInline
                        ref={(ref) => {
                          if (ref && v.stream) ref.srcObject = v.stream;
                        }}
                      ></video>
                    )}
                    <div
                      className={`${styles.gridLabel} ${styles.participantLabel}`}
                    >
                      {participantInfo[v.socketId]?.username ||
                        v.socketId.slice(0, 8)}
                      {participantInfo[v.socketId]?.audio === false && (
                        <MicOffIcon
                          sx={{ fontSize: "0.8rem", marginLeft: "0.3rem" }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
          ) : (
            <>
              {/* CENTER: Spotlight speaker */}
              <div className={styles.spotlightArea}>
                {screen && (
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
                )}

                {spotlightVideo ? (
                  <div className={styles.spotlightCard}>
                    {participantInfo[spotlightVideo.socketId]?.video ===
                    false ? (
                      <div className={styles.avatarFallback}>
                        <InitialsAvatar
                          name={
                            participantInfo[spotlightVideo.socketId]?.username
                          }
                        />
                      </div>
                    ) : (
                      <video
                        autoPlay
                        playsInline
                        ref={(ref) => {
                          if (ref && spotlightVideo.stream)
                            ref.srcObject = spotlightVideo.stream;
                        }}
                      ></video>
                    )}
                    <div
                      className={`${styles.spotlightLabel} ${styles.participantLabel}`}
                    >
                      {participantInfo[spotlightVideo.socketId]?.username ||
                        spotlightVideo.socketId.slice(0, 8)}
                      {participantInfo[spotlightVideo.socketId]?.audio ===
                        false && (
                        <MicOffIcon
                          sx={{
                            fontSize: "0.9rem",
                            marginLeft: "0.4rem",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.spotlightCard}>
                    {screen && screenView === "screen" ? (
                      <video
                        autoPlay
                        muted
                        ref={(ref) => {
                          if (ref && window.localStream)
                            ref.srcObject = window.localStream;
                        }}
                      ></video>
                    ) : !video ? (
                      <div className={styles.avatarFallback}>
                        <InitialsAvatar name={username} />
                      </div>
                    ) : (
                      <LocalVideo
                        stream={window.localStream}
                        registerRef={registerLocalVideoRef}
                      />
                    )}
                    <div
                      className={`${styles.spotlightLabel} ${styles.participantLabel}`}
                    >
                      {username || "You"}
                    </div>
                  </div>
                )}

                {spotlightVideo && (
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
                )}
              </div>

              {/* RIGHT: Participants strip */}
              <div className={styles.participantStrip}>
                <div className={styles.stripHeader}>
                  <PeopleIcon
                    style={{ fontSize: "0.9rem", color: "#5f6b4f" }}
                  />
                  <span>{videos.length + 1} in call</span>
                </div>

                <div className={styles.stripList}>
                  <div
                    className={`${styles.stripCard} ${!spotlightVideo ? styles.stripCardActive : ""}`}
                    onClick={() => setSpotlightId(null)}
                  >
                    {!video ? (
                      <div className={styles.avatarFallback}>
                        <InitialsAvatar name={username} size={40} />
                      </div>
                    ) : (
                      <video
                        autoPlay
                        muted
                        ref={(ref) => {
                          if (ref && window.localStream)
                            ref.srcObject = window.localStream;
                        }}
                      ></video>
                    )}
                    <div
                      className={`${styles.stripLabel} ${styles.participantLabel}`}
                    >
                      {username || "You"}
                    </div>
                  </div>

                  {videos.map((v) => (
                    <div
                      key={v.socketId}
                      className={`${styles.stripCard} ${spotlightId === v.socketId ? styles.stripCardActive : ""}`}
                      onClick={() => setSpotlightId(v.socketId)}
                    >
                      {participantInfo[v.socketId]?.video === false ? (
                        <div className={styles.avatarFallback}>
                          <InitialsAvatar
                            name={participantInfo[v.socketId]?.username}
                            size={40}
                          />
                        </div>
                      ) : (
                        <video
                          autoPlay
                          playsInline
                          ref={(ref) => {
                            if (ref && v.stream) ref.srcObject = v.stream;
                          }}
                        ></video>
                      )}
                      <div
                        className={`${styles.stripLabel} ${styles.participantLabel}`}
                      >
                        {participantInfo[v.socketId]?.username ||
                          v.socketId.slice(0, 8)}
                        {participantInfo[v.socketId]?.audio === false && (
                          <MicOffIcon
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
            </>
          )}
          {/* BOTTOM: Control bar */}
          <div className={styles.buttonContainers}>
            <div className={styles.controlBar}>
              {isMobile ? (
                <>
                  <div className={styles.controlBtn}>
                    <IconButton
                      aria-label={
                        video ? "Turn camera off" : "Turn camera on"
                      }
                      onClick={handleVideo}
                      className={`${styles.iconBtn} ${!video ? styles.iconBtnOff : ""}`}
                    >
                      {video ? <VideocamIcon /> : <VideocamOffIcon />}
                    </IconButton>
                  </div>

                  <div className={styles.controlBtn}>
                    <IconButton
                      aria-label={
                        audio ? "Mute microphone" : "Unmute microphone"
                      }
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
                            setViewMode((v) =>
                              v === "spotlight" ? "grid" : "spotlight",
                            );
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
              ) : (
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
                      onClick={() =>
                        setViewMode((v) =>
                          v === "spotlight" ? "grid" : "spotlight",
                        )
                      }
                      className={`${styles.iconBtn} ${viewMode === "grid" ? styles.iconBtnActive : ""}`}
                    >
                      {viewMode === "spotlight" ? (
                        <GridViewIcon />
                      ) : (
                        <ViewSidebarIcon />
                      )}
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
                    <IconButton
                      onClick={handleEndCall}
                      className={styles.iconBtnEnd}
                    >
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoMeetComponent;
