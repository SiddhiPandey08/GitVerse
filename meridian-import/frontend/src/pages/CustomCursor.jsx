import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const cursor = cursorRef.current;

    // Quick setters for the main arrow (zero lag)
    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.1,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.1,
      ease: "power3.out",
    });

    let prevX = 0;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      xTo(clientX);
      yTo(clientY);

      // Tilt the arrow slightly based on horizontal movement speed
      const deltaX = clientX - prevX;
      const tilt = Math.max(-15, Math.min(15, deltaX * 0.4));
      gsap.to(cursor, { rotation: tilt, duration: 0.2, ease: "power2.out" });

      // Animate the trail dots with increasing durations to create the "lag" effect
      // trails.forEach((trail, i) => {
      //   gsap.to(trail, {
      //     x: clientX,
      //     y: clientY,
      //     duration: 0.25 + i * 0.08, // Each subsequent dot takes slightly longer to catch up
      //     ease: "power2.out",
      //   });
      // });

      prevX = clientX;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Main Arrow */}
      <div ref={cursorRef} className="customSvgCursor" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3L10.07 19.97L13.58 13.58L19.97 10.07L3 3Z"
            fill="var(--rust)"
            stroke="var(--cream)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
