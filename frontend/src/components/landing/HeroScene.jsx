import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CODE_LINES = [
  "import { gitv } from '@gitverse';",
  "export async function pushBlob() {",
  "  await gitv.syncCluster('main');",
  "  return { status: 200, hash: '9f2c' };",
  "}",
];

// 10 extruded depth slices along translateZ for true physical thickness
const SLICES = [-18, -16, -14, -12, -10, -8, -6, -4, -2, -1];
const SLICE_TINTS = [
  "#06070c", "#080910", "#0a0c14", "#0c0e18", "#0f111d",
  "#121422", "#151827", "#181c2d", "#1c2033", "#20253a"
];

export default function HeroScene() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const monitorGroupRef = useRef(null);
  const propsLayerRef = useRef(null);
  const groundShadowRef = useRef(null);

  // Monitor Interactive Refs
  const codeTextRefs = useRef([]);
  const caretRef = useRef(null);
  const toastRef = useRef(null);

  // Light Props Interactive Refs
  const robotArmRef = useRef(null);
  const robotEyesRef = useRef(null);
  const chainNodesRef = useRef([]);
  const stickerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        codeTextRefs.current.forEach((el, i) => {
          if (el) el.textContent = CODE_LINES[i];
        });
        if (toastRef.current) toastRef.current.style.opacity = "1";
        return;
      }

      // 1. Entrance: Pieces fly in from translateZ -300px with rotation settle
      gsap.fromTo(
        stageRef.current,
        { z: -300, scale: 0.82, opacity: 0, rotateY: -28, rotateX: 16 },
        { z: 0, scale: 1, opacity: 1, rotateY: -18, rotateX: 6, duration: 1.1, ease: "back.out(1.7)", delay: 0.1 }
      );

      gsap.fromTo(
        propsLayerRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 0.9, scale: 1, duration: 0.8, ease: "power2.out", delay: 0.3 }
      );

      // 2. Idle Loops for Props: Robot wave & blink, props float
      if (robotArmRef.current) {
        gsap.to(robotArmRef.current, {
          rotation: 24,
          transformOrigin: "bottom left",
          yoyo: true,
          repeat: -1,
          duration: 0.42,
          ease: "power1.inOut",
        });
      }

      if (robotEyesRef.current) {
        gsap.timeline({ repeat: -1, repeatDelay: 3.2 }).to(robotEyesRef.current, {
          scaleY: 0.1,
          transformOrigin: "center center",
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        });
      }

      if (stickerRef.current) {
        gsap.to(stickerRef.current, {
          y: -6,
          rotation: 2,
          yoyo: true,
          repeat: -1,
          duration: 2.2,
          ease: "sine.inOut",
        });
      }

      const chainEl = propsLayerRef.current?.querySelector(".node-chain-group");
      if (chainEl) {
        gsap.to(chainEl, {
          y: -7,
          rotation: -2,
          yoyo: true,
          repeat: -1,
          duration: 2.7,
          ease: "sine.inOut",
        });
      }

      // 3. Monitor Code Typing & Synchronized Node Chain Pulse
      const caretCoords = [
        { x: 260, y: 154 },
        { x: 260, y: 174 },
        { x: 260, y: 194 },
        { x: 260, y: 214 },
        { x: 260, y: 234 },
      ];

      const triggerNodeChainPulse = () => {
        chainNodesRef.current.filter(Boolean).forEach((node, idx) => {
          gsap.fromTo(
            node,
            { scale: 1 },
            {
              scale: 1.5,
              transformOrigin: "center center",
              duration: 0.22,
              yoyo: true,
              repeat: 1,
              ease: "power2.out",
              delay: idx * 0.14,
            }
          );
        });
      };

      const startTypingLoop = () => {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.delayedCall(1.8, () => {
              if (toastRef.current) {
                gsap.to(toastRef.current, {
                  opacity: 0,
                  y: 8,
                  duration: 0.35,
                  onComplete: () => {
                    codeTextRefs.current.forEach((el) => {
                      if (el) el.textContent = "";
                    });
                    startTypingLoop();
                  },
                });
              }
            });
          },
        });

        CODE_LINES.forEach((line, lineIndex) => {
          const targetEl = codeTextRefs.current[lineIndex];
          if (!targetEl) return;

          const progress = { chars: 0 };
          tl.to(
            progress,
            {
              chars: line.length,
              duration: 0.6,
              ease: "none",
              onUpdate: () => {
                targetEl.textContent = line.slice(0, Math.floor(progress.chars));
                if (caretRef.current && caretCoords[lineIndex]) {
                  const xOffset = Math.floor(progress.chars) * 6.5;
                  caretRef.current.setAttribute("x", caretCoords[lineIndex].x + xOffset);
                  caretRef.current.setAttribute("y", caretCoords[lineIndex].y - 9);
                }
              },
            },
            lineIndex === 0 ? "+=0.2" : "+=0.12"
          );
        });

        tl.call(triggerNodeChainPulse, null, "+=0.15");

        if (toastRef.current) {
          tl.to(toastRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(2)" }, "<");
        }
      };

      startTypingLoop();

      // 4. Scroll Parallax: Layers drift apart
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": function () {
          const scrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.5,
            },
          });

          if (monitorGroupRef.current) scrollTl.to(monitorGroupRef.current, { y: -50, ease: "none" }, 0);
          if (propsLayerRef.current) scrollTl.to(propsLayerRef.current, { y: -85, ease: "none" }, 0);
          if (groundShadowRef.current) scrollTl.to(groundShadowRef.current, { y: 20, opacity: 0.2, ease: "none" }, 0);
        },
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onLeave: () => ctx.pause(),
        onEnterBack: () => ctx.resume(),
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Desktop Mouse Tilt Handler (~8deg tilt with preserve-3d depth)
  const handleMouseMove = (e) => {
    if (
      window.innerWidth < 768 ||
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(stageRef.current, {
      rotateY: -18 + relX * 12,
      rotateX: 6 - relY * 10,
      rotateZ: -2 + relX * 2,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (propsLayerRef.current) {
      gsap.to(propsLayerRef.current, {
        x: relX * 24,
        y: relY * 20,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = () => {
    gsap.to(stageRef.current, {
      rotateY: -18,
      rotateX: 6,
      rotateZ: -2,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });
    if (propsLayerRef.current) {
      gsap.to(propsLayerRef.current, { x: 0, y: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hero-scene-container relative w-full flex items-center justify-center select-none"
      style={{ perspective: "1400px" }}
    >
      {/* Soft Radial Purple/Cyan Glow Background */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "125%",
          height: "125%",
          background: "radial-gradient(circle at 48% 44%, rgba(168,85,247,0.16) 0%, rgba(0,240,255,0.09) 36%, rgba(10,11,16,0) 70%)",
          filter: "blur(45px)",
          transform: "translateZ(-120px)",
        }}
      />

      {/* Flattened Elliptical Ground Shadow under monitor stand */}
      <div
        ref={groundShadowRef}
        className="absolute pointer-events-none"
        style={{
          bottom: "12px",
          left: "50%",
          width: "380px",
          height: "85px",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)",
          filter: "blur(12px)",
          transform: "translateX(-48%) translateZ(-90px) rotateX(72deg)",
        }}
      />

      {/* 3D Preserved Stage Container */}
      <div
        ref={stageRef}
        className="hero-scene-stage relative w-full max-w-[540px]"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-18deg) rotateX(6deg) rotateZ(-2deg)",
          aspectRatio: "540 / 470",
        }}
      >
        {/* ================================================================= */}
        {/* 1. LIGHT PROPS LAYER at translateZ(-40px) */}
        {/* ================================================================= */}
        <div
          ref={propsLayerRef}
          className="absolute inset-0 pointer-events-none"
          style={{ transformStyle: "preserve-3d", transform: "translateZ(-40px)", opacity: 0.9 }}
        >
          <svg viewBox="0 0 540 470" className="w-full h-full overflow-visible" fill="none">
            <defs>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-yellow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* A. Commit-Node Chain (Top-Right, 4 nodes joined by line) */}
            <g className="node-chain-group">
              <line x1="380" y1="45" x2="485" y2="78" stroke="#00f0ff" strokeWidth="2" filter="url(#glow-cyan)" />
              <g ref={(el) => (chainNodesRef.current[0] = el)}>
                <circle cx="380" cy="45" r="10" fill="rgba(255,230,0,0.22)" stroke="#ffe600" strokeWidth="2" filter="url(#glow-yellow)" />
              </g>
              <g ref={(el) => (chainNodesRef.current[1] = el)}>
                <circle cx="415" cy="56" r="10" fill="rgba(0,240,255,0.22)" stroke="#00f0ff" strokeWidth="2" filter="url(#glow-cyan)" />
              </g>
              <g ref={(el) => (chainNodesRef.current[2] = el)}>
                <circle cx="450" cy="67" r="10" fill="rgba(168,85,247,0.22)" stroke="#a855f7" strokeWidth="2" />
              </g>
              <g ref={(el) => (chainNodesRef.current[3] = el)}>
                <circle cx="485" cy="78" r="10" fill="rgba(0,255,135,0.22)" stroke="#00ff87" strokeWidth="2" filter="url(#glow-green)" />
              </g>
            </g>

            {/* B. Robot Mascot (Sitting on monitor top-left corner) */}
            <g className="robot-mascot-group">
              <rect x="88" y="18" width="48" height="44" rx="10" fill="rgba(0,255,135,0.18)" stroke="#00ff87" strokeWidth="2" filter="url(#glow-green)" />
              <line x1="112" y1="18" x2="112" y2="4" stroke="#ff007f" strokeWidth="2" />
              <circle cx="112" cy="3" r="6" fill="rgba(255,0,127,0.25)" stroke="#ff007f" strokeWidth="2" />

              {/* Expressive Eyes */}
              <g ref={robotEyesRef}>
                <circle cx="103" cy="36" r="5.5" fill="rgba(0,240,255,0.25)" stroke="#00f0ff" strokeWidth="1.5" />
                <circle cx="104" cy="35" r="1.5" fill="#ffffff" />
                <circle cx="121" cy="36" r="5.5" fill="rgba(0,240,255,0.25)" stroke="#00f0ff" strokeWidth="1.5" />
                <circle cx="122" cy="35" r="1.5" fill="#ffffff" />
              </g>

              <path d="M 108 48 Q 112 52 116 48" stroke="#00ff87" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Waving Arm */}
              <g ref={robotArmRef}>
                <path d="M 136 38 Q 150 26 146 14" stroke="#00ff87" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <circle cx="146" cy="13" r="4.5" fill="#00ff87" />
              </g>
              <path d="M 88 42 Q 78 50 84 58" stroke="#00ff87" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </g>

            {/* C. Sticker: "gitv push" (Bottom-Left) */}
            <g ref={stickerRef} className="sticker-group">
              <rect x="30" y="350" width="95" height="32" rx="6" fill="rgba(255,230,0,0.16)" stroke="#ffe600" strokeWidth="2" filter="url(#glow-yellow)" />
              <text x="40" y="371" fontFamily="var(--font-mono, monospace)" fontSize="12" fontWeight="900" fill="#ffe600">
                gitv push ⚡
              </text>
            </g>
          </svg>
        </div>

        {/* ================================================================= */}
        {/* 2. SOLID 3D MONITOR (Extruded Slices along translateZ) */}
        {/* ================================================================= */}
        <div
          ref={monitorGroupRef}
          className="monitor-3d-assembly relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Deep Hard Offset Shadow behind monitor (translateZ -24px) */}
          <div className="absolute inset-0 pointer-events-none" style={{ transform: "translateZ(-24px)" }}>
            <svg viewBox="0 0 540 470" className="w-full h-full" fill="none">
              <rect x="80" y="74" width="384" height="264" rx="14" fill="#a855f7" stroke="#000000" strokeWidth="3.5" />
            </svg>
          </div>

          {/* Extruded Slices: 10 stacked copies in 1-2px steps for solid physical sides */}
          {SLICES.map((z, idx) => (
            <div key={idx} className="absolute inset-0 pointer-events-none" style={{ transform: `translateZ(${z}px)` }}>
              <svg viewBox="0 0 540 470" className="w-full h-full" fill="none">
                <rect x="70" y="64" width="384" height="264" rx="14" fill={SLICE_TINTS[idx]} stroke="#000000" strokeWidth="3" />
                <polygon points="246,328 278,328 274,392 250,392" fill={SLICE_TINTS[idx]} stroke="#000000" strokeWidth="3" />
                <rect x="195" y="392" width="134" height="18" rx="4" fill={SLICE_TINTS[idx]} stroke="#000000" strokeWidth="3" />
              </svg>
            </div>
          ))}

          {/* Front Face of Monitor at translateZ(0px) */}
          <div className="absolute inset-0" style={{ transform: "translateZ(0px)" }}>
            <svg viewBox="0 0 540 470" className="w-full h-full" fill="none">
              <defs>
                <linearGradient id="bezelLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#252a42" />
                  <stop offset="40%" stopColor="#171a2a" />
                  <stop offset="100%" stopColor="#0e101a" />
                </linearGradient>

                <linearGradient id="standLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2e3552" />
                  <stop offset="100%" stopColor="#111420" />
                </linearGradient>

                <linearGradient id="screenGloss" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
                  <stop offset="35%" stopColor="#ffffff" stopOpacity="0.04" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Stand Column & Base Front */}
              <polygon points="246,328 278,328 274,392 250,392" fill="url(#standLight)" stroke="#000000" strokeWidth="3.5" />
              <rect x="195" y="392" width="134" height="18" rx="4" fill="url(#standLight)" stroke="#000000" strokeWidth="3.5" />

              {/* Bezel Body with Top-Left Highlight Shading */}
              <rect x="70" y="64" width="384" height="264" rx="14" fill="url(#bezelLight)" stroke="#000000" strokeWidth="3.5" />

              {/* Subtle Inner Shadow Bezel Line */}
              <rect x="81" y="75" width="362" height="242" rx="7" fill="#05060b" stroke="#2a2f4a" strokeWidth="1.5" />

              {/* Inner Screen Canvas */}
              <rect x="84" y="78" width="356" height="236" rx="5" fill="#0a0c16" stroke="#000000" strokeWidth="2.5" />

              {/* Diagonal Gloss Across Screen */}
              <path d="M 84 78 L 225 78 L 155 314 L 84 314 Z" fill="url(#screenGloss)" pointerEvents="none" />

              {/* Screen Top Bar Chrome */}
              <g>
                <circle cx="100" cy="93" r="4" fill="#ff5c6c" stroke="#000" strokeWidth="1.2" />
                <circle cx="112" cy="93" r="4" fill="#ffe600" stroke="#000" strokeWidth="1.2" />
                <circle cx="124" cy="93" r="4" fill="#00ff87" stroke="#000" strokeWidth="1.2" />

                <rect x="146" y="85" width="160" height="16" rx="3" fill="#141728" stroke="#000000" strokeWidth="1.5" />
                <text x="156" y="96.5" fontFamily="var(--font-mono, monospace)" fontSize="8.5" fontWeight="800" fill="#00f0ff">
                  gitv ~ hyperscale-core
                </text>
              </g>

              {/* Explorer / Code Pane Divider */}
              <line x1="175" y1="106" x2="175" y2="280" stroke="#1f243b" strokeWidth="1.8" />

              {/* Left Pane: File Tree */}
              <g fontFamily="var(--font-mono, monospace)" fontSize="8">
                <text x="94" y="121" fill="#a855f7" fontWeight="900">EXPLORER</text>
                <text x="94" y="139" fill="#ffe600" fontWeight="700">📁 src</text>
                <rect x="92" y="146" width="76" height="14" fill="#ffe600" stroke="#000000" strokeWidth="1" />
                <text x="102" y="156.5" fill="#000000" fontWeight="900">📄 engine.ts</text>
                <text x="102" y="174" fill="#9ca3af">📄 cli.ts</text>
                <text x="94" y="190" fill="#00f0ff">📄 README.md</text>
                <text x="94" y="206" fill="#9ca3af">📄 package.json</text>
              </g>

              {/* Right Pane: Code Editor */}
              <g fontFamily="var(--font-mono, monospace)" fontSize="8.5">
                <g fill="#454c68" textAnchor="end">
                  <text x="194" y="154">1</text>
                  <text x="194" y="174">2</text>
                  <text x="194" y="194">3</text>
                  <text x="194" y="214">4</text>
                  <text x="194" y="234">5</text>
                </g>

                <text ref={(el) => (codeTextRefs.current[0] = el)} x="204" y="154" fill="#ff007f" fontWeight="700" />
                <text ref={(el) => (codeTextRefs.current[1] = el)} x="204" y="174" fill="#00f0ff" fontWeight="700" />
                <text ref={(el) => (codeTextRefs.current[2] = el)} x="204" y="194" fill="#f3f4f6" />
                <text ref={(el) => (codeTextRefs.current[3] = el)} x="204" y="214" fill="#ffe600" fontWeight="600" />
                <text ref={(el) => (codeTextRefs.current[4] = el)} x="204" y="234" fill="#00f0ff" />

                {/* Blinking Caret */}
                <rect ref={caretRef} x="204" y="145" width="5.5" height="11" fill="#ffe600" className="blinking-caret" />
              </g>

              {/* Bottom Commit Bar */}
              <g>
                <rect x="92" y="283" width="340" height="25" rx="3" fill="#111424" stroke="#000000" strokeWidth="1.8" />
                <circle cx="105" cy="295.5" r="4" fill="#00ff87" />
                <text x="115" y="299" fontFamily="var(--font-mono, monospace)" fontSize="8" fill="#f3f4f6" fontWeight="700">
                  commit <tspan fill="#ffe600">9f2c14</tspan> feat: cloud push (just now)
                </text>
                <rect x="388" y="288" width="38" height="15" rx="2" fill="#00ff87" stroke="#000" strokeWidth="1" />
                <text x="394" y="298.5" fontFamily="var(--font-mono, monospace)" fontSize="7.5" fontWeight="900" fill="#000">+14 -0</text>
              </g>

              {/* "PUSHED" Toast Popup */}
              <g ref={toastRef} opacity="0" style={{ willChange: "transform, opacity" }}>
                <rect x="195" y="228" width="220" height="28" rx="4" fill="#00ff87" stroke="#000000" strokeWidth="2.5" />
                <text x="206" y="246" fontFamily="var(--font-mono, monospace)" fontSize="9.5" fontWeight="900" fill="#000000">
                  ✔ PUSHED TO ORIGIN/MAIN [32KB]
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
