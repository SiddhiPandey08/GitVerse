function InitialsAvatar({ name, size = 72 }) {
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const colors = [
    "var(--rust)",
    "var(--sage)",
    "var(--mustard)",
    "var(--navy)",
    "var(--dust-blue)",
  ];
  const color = colors[(name || "").charCodeAt(0) % colors.length || 0];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontSize: size / 2.5,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default InitialsAvatar;
