import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Plus as PlusIcon, PaperPlaneTilt as SendIcon } from "@phosphor-icons/react";
import client from "../../api/client";
import LoadingState from "../common/LoadingState";
import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_MSG_LEN = 2000;

// ─── Style tokens ──────────────────────────────────────────────────────────────
const S = {
  bg: "#0d1117",
  header: "#161b22",
  border: "1px solid #30363d",
  radius: "6px",
  text: "#c9d1d9",
  muted: "#8b949e",
  accent: "#58a6ff",
  error: "#f85149",
  btnBg: "#21262d",
  btnHover: "#30363d",
};

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ChannelSidebar({ channels, selected, onSelect, isOwner, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [addError, setAddError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    setSubmitting(true);
    setAddError("");
    try {
      await onAdd(trimmed);
      setName("");
      setAdding(false);
    } catch (err) {
      setAddError(err?.response?.data?.message || err?.message || "Failed to create channel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    if (e.key === "Escape") { setAdding(false); setName(""); setAddError(""); }
  };

  return (
    <Box
      sx={{
        width: 180,
        minWidth: 150,
        borderRight: S.border,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        backgroundColor: S.header,
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: S.border,
        }}
      >
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Channels
        </Typography>
        {isOwner && (
          <IconButton
            size="small"
            onClick={() => { setAdding(true); setAddError(""); }}
            sx={{ color: S.muted, p: 0.25, "&:hover": { color: S.text } }}
            title="Add channel"
          >
            <PlusIcon size={14} />
          </IconButton>
        )}
      </Box>

      {/* Channel list */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 0.5 }}>
        {channels.map((ch) => (
          <Box
            key={ch._id}
            onClick={() => onSelect(ch)}
            sx={{
              px: 1.5,
              py: 0.75,
              cursor: "pointer",
              borderRadius: "4px",
              mx: 0.5,
              backgroundColor: selected?._id === ch._id ? "#30363d" : "transparent",
              color: selected?._id === ch._id ? S.text : S.muted,
              fontSize: "13px",
              "&:hover": { backgroundColor: "#30363d", color: S.text },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span style={{ color: S.muted }}>#</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ch.name}
            </span>
          </Box>
        ))}
      </Box>

      {/* Add channel inline input */}
      {adding && (
        <Box sx={{ px: 1, py: 1, borderTop: S.border }}>
          <TextField
            autoFocus
            size="small"
            placeholder="channel-name"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
            onKeyDown={handleKey}
            disabled={submitting}
            inputProps={{ maxLength: 40 }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                fontSize: "12px",
                color: S.text,
                backgroundColor: S.bg,
                "& fieldset": { borderColor: "#30363d" },
                "&:hover fieldset": { borderColor: S.accent },
                "&.Mui-focused fieldset": { borderColor: S.accent },
              },
            }}
          />
          {addError && (
            <Typography sx={{ fontSize: "11px", color: S.error, mt: 0.5, wordBreak: "break-word" }}>
              {addError}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.75 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={submitting}
              onClick={handleSubmit}
              sx={{
                fontSize: "11px",
                py: 0.25,
                px: 1,
                textTransform: "none",
                color: S.text,
                borderColor: "#30363d",
                backgroundColor: S.btnBg,
                "&:hover": { backgroundColor: S.btnHover },
              }}
            >
              {submitting ? <CircularProgress size={10} sx={{ color: S.accent }} /> : "Add"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={submitting}
              onClick={() => { setAdding(false); setName(""); setAddError(""); }}
              sx={{
                fontSize: "11px",
                py: 0.25,
                px: 1,
                textTransform: "none",
                color: S.muted,
                borderColor: "#30363d",
                backgroundColor: S.btnBg,
                "&:hover": { backgroundColor: S.btnHover },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function MessageRow({ msg }) {
  return (
    <Box sx={{ px: 2, py: 0.75, "&:hover": { backgroundColor: "rgba(48,54,61,0.3)" } }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.25 }}>
        <Typography
          component="span"
          sx={{ fontSize: "13px", fontWeight: 700, color: S.accent, lineHeight: 1.4 }}
        >
          {msg.sender?.username || "unknown"}
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: "11px", color: S.muted, lineHeight: 1.4 }}
        >
          {formatTime(msg.createdAt)}
        </Typography>
      </Box>
      <Typography
        component="pre"
        sx={{
          fontSize: "13px",
          color: S.text,
          m: 0,
          fontFamily: "inherit",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: 1.5,
        }}
      >
        {msg.text}
      </Typography>
    </Box>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function RepoChat({ repoId, isOwner }) {
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesBoxRef = useRef(null);

  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError, setChannelsError] = useState("");

  const [selectedChannel, setSelectedChannel] = useState(null);
  const [joinError, setJoinError] = useState("");

  const [messages, setMessages] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [msgsError, setMsgsError] = useState("");
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const [text, setText] = useState("");
  const [sendError, setSendError] = useState("");

  // Track which channel socket has joined
  const joinedChannelRef = useRef(null);
  const selectedChannelRef = useRef(null);

  // ── Socket lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(BASE_URL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("channel:message", (msg) => {
      const currentChannel = selectedChannelRef.current;
      if (!currentChannel || msg.channel !== currentChannel._id) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Auto-scroll only if near bottom
      const box = messagesBoxRef.current;
      if (box) {
        const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
        if (nearBottom) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
      }
    });

    return () => {
      if (joinedChannelRef.current) {
        socket.emit("channel:leave", joinedChannelRef.current);
      }
      socket.disconnect();
    };
  }, []);

  // ── Load channels ─────────────────────────────────────────────────────────
  const loadChannels = useCallback(async () => {
    setChannelsLoading(true);
    setChannelsError("");
    try {
      const res = await client.get(`/chat/repos/${repoId}/channels`);
      const list = res.data || [];
      setChannels(list);
      if (list.length > 0) {
        const general = list.find((c) => c.name === "general") || list[0];
        setSelectedChannel(general);
        selectedChannelRef.current = general;
      }
    } catch (err) {
      setChannelsError(err?.response?.data?.message || err?.message || "Failed to load channels.");
    } finally {
      setChannelsLoading(false);
    }
  }, [repoId]);

  useEffect(() => { loadChannels(); }, [loadChannels]);

  // ── Load messages ─────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (channelId, before = null) => {
    const url = before
      ? `/chat/channels/${channelId}/messages?before=${encodeURIComponent(before)}`
      : `/chat/channels/${channelId}/messages`;
    const res = await client.get(url);
    return res.data || [];
  }, []);

  // ── Join a channel ────────────────────────────────────────────────────────
  const joinChannel = useCallback(
    async (channel) => {
      const socket = socketRef.current;
      if (!socket) return;

      setJoinError("");
      setMsgsError("");
      setMsgsLoading(true);
      setMessages([]);
      setHasOlder(false);

      // Leave previous
      if (joinedChannelRef.current && joinedChannelRef.current !== channel._id) {
        socket.emit("channel:leave", joinedChannelRef.current);
        joinedChannelRef.current = null;
      }

      // Join new channel
      await new Promise((resolve) => {
        socket.emit("channel:join", channel._id, (ack) => {
          if (!ack?.ok) {
            setJoinError(ack?.error || "Could not join channel.");
          } else {
            joinedChannelRef.current = channel._id;
          }
          resolve();
        });
      });

      // Load history
      try {
        const msgs = await loadMessages(channel._id);
        setMessages(msgs);
        setHasOlder(msgs.length === 50);
      } catch (err) {
        setMsgsError(err?.response?.data?.message || err?.message || "Failed to load messages.");
      } finally {
        setMsgsLoading(false);
      }

      // Scroll to bottom
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 50);
    },
    [loadMessages],
  );

  // Re-join when selectedChannel changes
  useEffect(() => {
    if (!selectedChannel) return;
    selectedChannelRef.current = selectedChannel;
    joinChannel(selectedChannel);
  }, [selectedChannel, joinChannel]);

  // ── Load older messages ───────────────────────────────────────────────────
  const handleLoadOlder = async () => {
    if (!selectedChannel || messages.length === 0) return;
    const before = messages[0].createdAt;
    setLoadingOlder(true);
    try {
      const older = await loadMessages(selectedChannel._id, before);
      const box = messagesBoxRef.current;
      const prevScrollHeight = box ? box.scrollHeight : 0;

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m._id));
        const fresh = older.filter((m) => !existingIds.has(m._id));
        return [...fresh, ...prev];
      });
      setHasOlder(older.length === 50);

      // Restore scroll position
      if (box) {
        setTimeout(() => {
          box.scrollTop = box.scrollHeight - prevScrollHeight;
        }, 0);
      }
    } catch (err) {
      setMsgsError(err?.response?.data?.message || err?.message || "Failed to load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  };

  // ── Add channel ───────────────────────────────────────────────────────────
  const handleAddChannel = async (name) => {
    const res = await client.post(`/chat/repos/${repoId}/channels`, { name });
    const newCh = res.data;
    setChannels((prev) => [...prev, newCh]);
    setSelectedChannel(newCh);
    selectedChannelRef.current = newCh;
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !selectedChannel || trimmed.length > MAX_MSG_LEN) return;

    const socket = socketRef.current;
    setSendError("");

    socket.emit("channel:message", selectedChannel._id, trimmed, (ack) => {
      if (ack?.ok) {
        setText("");
      } else {
        setSendError(ack?.error || "Failed to send message.");
      }
    });
  }, [text, selectedChannel]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (channelsLoading) {
    return (
      <Paper elevation={0} sx={{ backgroundColor: S.bg, border: S.border, borderRadius: S.radius, mb: 3 }}>
        <LoadingState message="Loading channels..." />
      </Paper>
    );
  }

  if (channelsError) {
    return (
      <Paper elevation={0} sx={{ backgroundColor: S.bg, border: S.border, borderRadius: S.radius, mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <ErrorState message={channelsError} onRetry={loadChannels} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: S.bg,
        border: S.border,
        borderRadius: S.radius,
        mb: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top header */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          backgroundColor: S.header,
          borderBottom: S.border,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: S.text }}>
          {selectedChannel ? `#${selectedChannel.name}` : "Chat"}
        </Typography>
        <Typography sx={{ fontSize: "12px", color: S.muted }}>
          &middot; {channels.length} channel{channels.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* xs: horizontal chip strip for channels */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          gap: 0.75,
          px: 1.5,
          py: 1,
          overflowX: "auto",
          borderBottom: S.border,
          backgroundColor: S.header,
          flexWrap: "nowrap",
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#30363d", borderRadius: 2 },
        }}
      >
        {channels.map((ch) => (
          <Chip
            key={ch._id}
            label={`#${ch.name}`}
            size="small"
            onClick={() => { setSelectedChannel(ch); selectedChannelRef.current = ch; }}
            sx={{
              fontSize: "12px",
              cursor: "pointer",
              backgroundColor: selectedChannel?._id === ch._id ? "#30363d" : S.btnBg,
              color: selectedChannel?._id === ch._id ? S.text : S.muted,
              border: S.border,
              flexShrink: 0,
              "&:hover": { backgroundColor: "#30363d" },
            }}
          />
        ))}
      </Box>

      {/* Body: sidebar (md+) + main area */}
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar — md+ only */}
        <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column" }}>
          <ChannelSidebar
            channels={channels}
            selected={selectedChannel}
            onSelect={(ch) => { setSelectedChannel(ch); selectedChannelRef.current = ch; }}
            isOwner={isOwner}
            onAdd={handleAddChannel}
          />
        </Box>

        {/* Main chat area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Join error */}
          {joinError && (
            <Box sx={{ px: 2, pt: 1.5 }}>
              <ErrorState message={joinError} onRetry={() => selectedChannel && joinChannel(selectedChannel)} />
            </Box>
          )}

          {/* Messages area */}
          <Box
            ref={messagesBoxRef}
            sx={{
              height: "480px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "#30363d", borderRadius: 3 },
            }}
          >
            {/* Load older button */}
            {hasOlder && !msgsLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={loadingOlder}
                  onClick={handleLoadOlder}
                  sx={{
                    fontSize: "12px",
                    textTransform: "none",
                    color: S.text,
                    borderColor: "#30363d",
                    backgroundColor: S.btnBg,
                    "&:hover": { backgroundColor: S.btnHover },
                  }}
                >
                  {loadingOlder && <CircularProgress size={12} sx={{ color: S.accent, mr: 0.75 }} />}
                  Load older messages
                </Button>
              </Box>
            )}

            {/* Loading state */}
            {msgsLoading && <LoadingState message="Loading messages..." />}

            {/* Error state */}
            {!msgsLoading && msgsError && (
              <Box sx={{ p: 2 }}>
                <ErrorState message={msgsError} onRetry={() => selectedChannel && joinChannel(selectedChannel)} />
              </Box>
            )}

            {/* Empty state */}
            {!msgsLoading && !msgsError && !joinError && messages.length === 0 && (
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <EmptyState message={`No messages yet in #${selectedChannel?.name || "this channel"}. Say hello!`} />
              </Box>
            )}

            {/* Message list */}
            {!msgsLoading && !msgsError && messages.map((msg) => (
              <MessageRow key={msg._id} msg={msg} />
            ))}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input area */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: S.border,
              backgroundColor: S.bg,
            }}
          >
            {sendError && (
              <Typography sx={{ fontSize: "12px", color: S.error, mb: 0.75 }}>
                {sendError}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
              <TextField
                multiline
                maxRows={5}
                placeholder={`Message #${selectedChannel?.name || "channel"}`}
                value={text}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_MSG_LEN) setText(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                disabled={!selectedChannel || !!joinError}
                size="small"
                fullWidth
                inputProps={{ maxLength: MAX_MSG_LEN }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "13px",
                    color: S.text,
                    backgroundColor: "#161b22",
                    "& fieldset": { borderColor: "#30363d" },
                    "&:hover fieldset": { borderColor: "#58a6ff66" },
                    "&.Mui-focused fieldset": { borderColor: S.accent },
                  },
                  "& .MuiInputBase-input::placeholder": { color: S.muted, opacity: 1 },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!text.trim() || !selectedChannel || !!joinError}
                sx={{
                  backgroundColor: S.accent,
                  color: "#fff",
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  mb: 0.1,
                  "&:hover": { backgroundColor: "#79b8ff" },
                  "&.Mui-disabled": { backgroundColor: "#30363d", color: S.muted },
                }}
              >
                <SendIcon size={16} />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
              <Typography sx={{ fontSize: "11px", color: text.length > MAX_MSG_LEN * 0.9 ? S.error : S.muted }}>
                {text.length}/{MAX_MSG_LEN}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
