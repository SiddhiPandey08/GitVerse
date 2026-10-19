import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ROWS = [
  {
    items: [
      "Peer-to-peer video",
      "High-quality video, intelligent collaboration, and a workspace designed for today's distributed teams.",
    ],
    color: "rust",
    speed: 37,
  },
  {
    items: ["Close the distance", "Work together, wherever you are."],
    color: "sage",
    speed: 42,
  },
  {
    items: ["No signups for guests", "Join in seconds. Stay connected."],
    color: "navy",
    speed: 38,
  },
  {
    items: ["Meeting history saved", "Pick up where you left off"],
    color: "mustard",
    speed: 46,
  },
  {
    items: ["Share a link, that's it", "Nothing to schedule"],
    color: "dustBlue",
    speed: 40,
  },
];

function MarqueeRow({ items, direction, speed, color }) {
  const trackRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const track = trackRef.current;
    const width = track.scrollWidth / 2;

    const tween = gsap.fromTo(
      track,
      { x: direction > 0 ? 0 : -width },
      {
        x: direction > 0 ? -width : 0,
        duration: speed,
        ease: "none",
        repeat: -1,
      },
    );

    return () => tween.kill();
  }, [direction, speed]);

  const content = [...items, ...items, ...items];

  return (
    <div className="marqueeRow">
      <div ref={trackRef} className={`marqueeTrack marquee-${color}`}>
        {content.map((text, i) => (
          <span key={i} className="marqueeItem">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function MarqueeBackground() {
  return (
    <div className="marqueeBackground" aria-hidden="true">
      {ROWS.map((row, i) => (
        <MarqueeRow
          key={i}
          items={row.items}
          direction={i % 2 === 0 ? 1 : -1}
          speed={row.speed}
          color={row.color}
        />
      ))}
    </div>
  );
}

export default MarqueeBackground;
