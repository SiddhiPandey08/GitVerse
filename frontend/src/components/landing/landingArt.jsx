import { useId } from "react";

const ROCKS = {
  warm: ["#a58bf0", "#8369d6", "#5f48ad", "#3f2f80"],
  cool: ["#86a0f2", "#6482dc", "#4259b0", "#2d3d8a"],
};

export function Island({ tone = "warm" }) {
  const [c0, c1, c2, c3] = ROCKS[tone];
  return (
    <svg className="gv-island" viewBox="0 0 200 240" aria-hidden="true">
      <polygon points="6,56 100,72 48,118" fill={c0} />
      <polygon points="100,72 48,118 100,140" fill={c1} />
      <polygon points="48,118 100,140 72,176" fill={c1} />
      <polygon points="100,140 72,176 100,234" fill={c2} />
      <polygon points="100,72 194,56 152,118" fill={c2} />
      <polygon points="100,72 152,118 100,140" fill={c3} />
      <polygon points="152,118 100,140 128,176" fill={c3} />
      <polygon points="100,140 128,176 100,234" fill={c3} />
      <ellipse cx="100" cy="62" rx="94" ry="17" fill="#1b7a59" />
      <ellipse cx="100" cy="56" rx="94" ry="17" fill="#2fbf8a" />
      <ellipse cx="88" cy="52" rx="62" ry="9" fill="#46d9a3" />
      <path
        d="M30 52l6-22 6 22zM50 50l5-30 6 30zM146 50l5-26 6 26zM166 52l5-18 5 18z"
        fill="#1f8f6a"
      />
      <polygon points="112,50 118,32 124,50" fill="#7fe8d0" />
      <polygon points="118,32 124,50 118,50" fill="#4cc9b0" />
      <polygon points="14,186 27,179 34,191 21,199" fill={c1} />
      <polygon points="172,166 182,162 186,172 177,176" fill={c2} />
    </svg>
  );
}

export function Sphere() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="0.34" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#86a2ff" />
          <stop offset="0.55" stopColor="#4666e6" />
          <stop offset="1" stopColor="#1f2f86" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="200" cy="200" r="140" />
        </clipPath>
      </defs>
      {/* back half of the ring sits behind the planet */}
      <g transform="rotate(-22 200 200)">
        <path
          d="M8 200A192 54 0 0 1 392 200"
          fill="none"
          stroke="#cfd8ff"
          strokeOpacity="0.4"
          strokeWidth="2"
        />
      </g>
      <circle cx="200" cy="200" r="140" fill={`url(#${id}-body)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <ellipse
          cx="270"
          cy="150"
          rx="64"
          ry="42"
          fill="#6a52cc"
          opacity="0.85"
          transform="rotate(32 270 150)"
        />
        <ellipse
          cx="135"
          cy="125"
          rx="48"
          ry="22"
          fill="#3a58cf"
          opacity="0.9"
          transform="rotate(-20 135 125)"
        />
        <circle cx="236" cy="250" r="7" fill="#2a3a9a" opacity="0.8" />
        <circle cx="256" cy="262" r="5" fill="#2a3a9a" opacity="0.8" />
        <circle cx="150" cy="240" r="8" fill="#2a3a9a" opacity="0.8" />
        <circle cx="262" cy="214" r="150" fill="#0a1040" opacity="0.28" />
      </g>
      {/* front half passes over the planet */}
      <g transform="rotate(-22 200 200)">
        <path
          d="M8 200A192 54 0 0 0 392 200"
          fill="none"
          stroke="#e9edff"
          strokeOpacity="0.95"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

export function RepoPlanet() {
  const id = useId().replace(/:/g, "");
  const nodes = [
    [328, 154],
    [224, 66],
    [82, 132],
    [82, 268],
    [176, 334],
    [318, 268],
  ];
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-a`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#5b7be8" />
          <stop offset="1" stopColor="#2c3f9e" />
        </radialGradient>
        <radialGradient id={`${id}-b`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#6a45b8" />
          <stop offset="1" stopColor="#38206f" />
        </radialGradient>
        <radialGradient id={`${id}-c`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffd19a" />
          <stop offset="1" stopColor="#e0894f" />
        </radialGradient>
      </defs>
      <circle
        cx="200"
        cy="200"
        r="192"
        fill="none"
        stroke="#f1f3ff"
        strokeWidth="2.5"
        strokeDasharray="860 350"
        strokeLinecap="round"
      />
      <circle cx="200" cy="200" r="168" fill={`url(#${id}-a)`} />
      <circle
        cx="200"
        cy="200"
        r="140"
        fill="none"
        stroke="#cdd8ff"
        strokeOpacity="0.16"
        strokeDasharray="2 8"
      />
      <circle cx="200" cy="200" r="112" fill={`url(#${id}-b)`} />
      <circle cx="200" cy="200" r="52" fill={`url(#${id}-c)`} />
      <g className="gv-spin">
        <path
          d="M328 154L224 66L82 132L82 268L176 334L318 268Z"
          fill="none"
          stroke="#f1f3ff"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />
        {nodes.map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle
              cx={cx}
              cy={cy}
              r="9"
              fill="none"
              stroke="#cdd8ff"
              strokeOpacity="0.4"
            />
            <circle cx={cx} cy={cy} r="5" fill="#dfe6ff" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function Moon() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c066d8" />
          <stop offset="1" stopColor="#6b2f86" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect width="120" height="120" fill="black" />
          <circle cx="60" cy="60" r="50" fill="white" />
          <circle cx="42" cy="46" r="48" fill="black" />
        </mask>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="50"
        fill={`url(#${id}-fill)`}
        mask={`url(#${id}-mask)`}
      />
    </svg>
  );
}

// Original mark for the preloader (replace with your real logo later).
export function LogoMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="GitVerse">
      <circle cx="32" cy="32" r="30" fill="#14183f" stroke="#9274f5" strokeWidth="2" />
      <path
        d="M22 18v28M22 32c0-8 20-4 20-14"
        fill="none"
        stroke="#cdd8ff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="22" cy="18" r="4.5" fill="#a99bff" />
      <circle cx="22" cy="46" r="4.5" fill="#a99bff" />
      <circle cx="42" cy="18" r="4.5" fill="#2dd4bf" />
    </svg>
  );
}
/*
  The front half of the grass. A character is drawn between <Island />
  and <IslandLip />, so it looks like it is standing in the grass
  rather than pasted on top of it.
*/
export function IslandLip() {
  return (
    <svg className="gv-lip" viewBox="0 0 200 240" aria-hidden="true">
      <path d="M6 56A94 17 0 0 0 194 56Z" fill="#2fbf8a" />
      <path
        d="M26 60a74 12 0 0 0 148 0"
        fill="none"
        stroke="#46d9a3"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M16 58l4-14 4 14zM176 58l4-12 4 12z" fill="#1f8f6a" />
    </svg>
  );
}
