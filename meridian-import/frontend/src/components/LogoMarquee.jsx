import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const LETTER_COLORS = [
  "var(--rust)",
  "var(--sage)",
  "var(--rust)",
  "var(--mustard)",
  "var(--navy-light, var(--dust-blue))",
  "var(--rust)",
  "var(--mustard)",
  "var(--dust-blue)",
];

function MeridianWord({ size }) {
  const letters = "meridian".split("");
  return (
    <span className="logoMarqueeWord" style={{ fontSize: size }}>
      {letters.map((ch, i) => (
        <span
          key={i}
          style={{ color: LETTER_COLORS[i % LETTER_COLORS.length] }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function LogoRow({ direction, speed, size }) {
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

  const items = new Array(10).fill(0);

  return (
    <div className="logoMarqueeRow">
      <div ref={trackRef} className="logoMarqueeTrack">
        {items.map((_, i) => (
          <MeridianWord key={i} size={size} />
        ))}
      </div>
    </div>
  );
}

function LogoMarquee() {
  return (
    <div className="logoMarqueeBackground" aria-hidden="true">
      <LogoRow direction={1} speed={30} size="1.8rem" />
      <LogoRow direction={-1} speed={38} size="2.4rem" />
      <LogoRow direction={1} speed={34} size="1.5rem" />
      <LogoRow direction={-1} speed={42} size="2.1rem" />
    </div>
  );
}

export default LogoMarquee;
