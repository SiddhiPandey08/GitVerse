import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Terminal,
  Code2,
  GitBranch,
  GitCommit,
  Zap,
  Check,
  ChevronRight,
  Copy,
  Star,
  CheckCircle2,
  Folder,
  User,
  Shield,
  Activity,
  ArrowRight,
  FileText,
  Lock,
} from "../common/icons";
import HeroScene from "./HeroScene";
import "./landing.css";

gsap.registerPlugin(ScrollTrigger);

// -----------------------------------------------------------------------------
// Data: Believable CLI Story Commands
// -----------------------------------------------------------------------------
const CLI_STEPS = [
  {
    step: "01",
    cmd: "gitv login",
    args: "",
    out: "> Authenticating via browser OAuth...\n✔ Token securely stored in ~/.gitv/config.json\n✔ Bearer session activated for @dev_mahesh",
    badge: "AUTH STORED",
  },
  {
    step: "02",
    cmd: "gitv whoami",
    args: "",
    out: "LOGGED IN: dev_mahesh (ID: usr_7a91bf)\nActive Repos: 14  |  Followers: 382  |  Auth: Bearer JWT",
    badge: "SESSION VALID",
  },
  {
    step: "03",
    cmd: "gitv init",
    args: "hyperscale-core",
    out: "✔ Initialized empty GitVerse repository in ./hyperscale-core/.gitv/\n✔ Linked to remote cluster: https://gitverse.dev/dev_mahesh/hyperscale-core",
    badge: "REPO INITIALIZED",
  },
  {
    step: "04",
    cmd: "gitv add",
    args: "src/ index.html package.json",
    out: "✔ Staged 12 tracked source files\n✔ Delta hashes computed (SHA-256 tree built)",
    badge: "12 FILES STAGED",
  },
  {
    step: "05",
    cmd: "gitv commit",
    args: '-m "feat: real-time streaming engine"',
    out: "[main e83f12a] feat: real-time streaming engine\n12 files changed, 542 insertions(+), 0 deletions(-)",
    badge: "COMMIT CREATED",
  },
  {
    step: "06",
    cmd: "gitv push",
    args: "origin main",
    out: "Pushing objects to GitVerse Cloud...\nDelta compressed 28.4 KiB across 12 blobs\n✔ Remote HEAD updated -> main",
    badge: "PUSH COMPLETE",
  },
  {
    step: "07",
    cmd: "gitv log",
    args: "--oneline -n 3",
    out: "e83f12a (HEAD -> main, origin/main) feat: real-time streaming engine (just now)\n3c91a02 chore: bootstrap Vite & Tailwind config\n1a084ef Initial repository commit",
    badge: "HISTORY SYNCED",
  },
];

// -----------------------------------------------------------------------------
// Data: Repo Files & Sample Code for Repo Story
// -----------------------------------------------------------------------------
const REPO_FILES = [
  { name: "src", isFolder: true },
  { name: "engine.ts", isFolder: false, indent: true, active: true },
  { name: "protocol.ts", isFolder: false, indent: true },
  { name: "client.ts", isFolder: false, indent: true },
  { name: "README.md", isFolder: false },
  { name: "package.json", isFolder: false },
];

const CODE_LINES = [
  "// GitVerse Core Engine v3.4.1",
  "import { createCluster, BlobStorage } from '@gitverse/engine';",
  "",
  "export async function syncCommitTree(repoId: string, commitHash: string) {",
  "  const tree = await BlobStorage.resolveTree(commitHash);",
  "  const syncStatus = await createCluster().dispatch(repoId, tree.blobs);",
  "  return { status: 200, snapshot: syncStatus.hash };",
  "}",
];

// -----------------------------------------------------------------------------
// Data: Stack Items for Infinite Marquee
// -----------------------------------------------------------------------------
const STACK_ITEMS = [
  "REACT 19",
  "NODE.JS",
  "MONGODB BLOBS",
  "JWT SECURITY",
  "EXPRESS REST API",
  "VITE BUILDER",
  "TAILWIND CSS",
  "GSAP SCROLL ENGINE",
  "SOCKET.IO REALTIME",
];

export default function Landing() {
  const [copiedCli, setCopiedCli] = useState(false);
  const activeCmdStringRef = useRef(CLI_STEPS[0].cmd);

  // Animation Refs
  const landingContainerRef = useRef(null);
  const progressBarRef = useRef(null);
  const heroRef = useRef(null);
  const heroHeadlineRef = useRef(null);
  const heroBadgesRef = useRef(null);
  const heroCardRef = useRef(null);
  const heroButtonsRef = useRef(null);

  // CLI Story Refs
  const cliSectionRef = useRef(null);
  const cliPinRef = useRef(null);
  const cliCmdTextRef = useRef(null);
  const cliOutputRef = useRef(null);
  const cliBadgeRef = useRef(null);
  const cliStepItemsRef = useRef([]);

  // Repo Story Refs
  const repoSectionRef = useRef(null);
  const repoPinRef = useRef(null);
  const repoFileRowsRef = useRef([]);
  const repoSelectionBarRef = useRef(null);
  const repoCodeLinesRef = useRef([]);
  const repoConnectorRef = useRef(null);
  const repoCommitRowRef = useRef(null);
  const repoStarBtnRef = useRef(null);
  const repoStarCountRef = useRef(null);
  const repoStarIconRef = useRef(null);

  // Feature Cards Refs
  const featuresSectionRef = useRef(null);
  const featureCardsRef = useRef([]);

  // Stack Marquee Refs
  const marqueeTrackRef = useRef(null);

  // CTA Refs
  const ctaSectionRef = useRef(null);
  const ctaBgRef = useRef(null);
  const ctaHeadlineRef = useRef(null);

  // Copy CLI Command to clipboard
  const handleCopyCmd = () => {
    navigator.clipboard.writeText(activeCmdStringRef.current);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 1800);
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Use GSAP Context for full cleanup in React 19 StrictMode
    const ctx = gsap.context(() => {
      // 1. Top Scroll Progress Bar
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: landingContainerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
      }

      // If user prefers reduced motion, show final states without pinning or parallax
      if (prefersReducedMotion) {
        if (cliOutputRef.current) cliOutputRef.current.style.opacity = "1";
        if (repoConnectorRef.current)
          repoConnectorRef.current.style.strokeDashoffset = "0";
        if (repoCommitRowRef.current)
          repoCommitRowRef.current.style.opacity = "1";
        return;
      }

      // -----------------------------------------------------------------------
      // 2. HERO: Word-by-word masked slide-up & Sticker Badges
      // -----------------------------------------------------------------------
      const heroWords = heroHeadlineRef.current?.querySelectorAll(".hero-word");
      if (heroWords && heroWords.length > 0) {
        gsap.to(heroWords, {
          y: "0%",
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.05,
          delay: 0.15,
        });
      }

      // Sticker Badges settle in with slight rotation
      const badges = heroBadgesRef.current?.querySelectorAll(".neo-badge");
      if (badges && badges.length > 0) {
        gsap.from(badges, {
          scale: 0.85,
          rotation: -10,
          opacity: 0,
          duration: 0.6,
          ease: "back.out(1.8)",
          stagger: 0.08,
          delay: 0.4,
        });
      }

      // Hero Scroll-Away Parallax (only on desktop/tablet >= 768px)
      ScrollTrigger.matchMedia({
        "(min-width: 768px)": function () {
          const heroTl = gsap.timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          });

          if (heroHeadlineRef.current) {
            heroTl.to(heroHeadlineRef.current, { y: -70, ease: "none" }, 0);
          }
          if (heroBadgesRef.current) {
            heroTl.to(heroBadgesRef.current, { y: -110, ease: "none" }, 0);
          }
          if (heroButtonsRef.current) {
            heroTl.to(heroButtonsRef.current, { y: -80, ease: "none" }, 0);
          }
          if (heroCardRef.current) {
            heroTl.to(heroCardRef.current, { y: -45, ease: "none" }, 0);
          }
        },
      });

      // -----------------------------------------------------------------------
      // 3. PINNED CLI STORY: Typing, Status swap, Scrubbing backward un-types
      // -----------------------------------------------------------------------
      const updateCliStep = (progress) => {
        const stepCount = CLI_STEPS.length;
        const totalVal = Math.min(progress * stepCount, stepCount - 0.001);
        const index = Math.floor(totalVal);
        const fraction = totalVal - index;
        const currentData = CLI_STEPS[index];
        const fullCommand = currentData.args
          ? `${currentData.cmd} ${currentData.args}`
          : currentData.cmd;

        activeCmdStringRef.current = fullCommand;

        // Typing logic (types during first 50% of the step, output appears afterwards)
        const typeLimit = 0.48;
        let typedLen = 0;
        let showOutput = false;
        let outputOpacity = 0;

        if (fraction <= typeLimit) {
          typedLen = Math.floor((fraction / typeLimit) * fullCommand.length);
          showOutput = false;
        } else {
          typedLen = fullCommand.length;
          showOutput = true;
          outputOpacity = Math.min((fraction - typeLimit) / 0.25, 1);
        }

        if (cliCmdTextRef.current) {
          cliCmdTextRef.current.textContent = fullCommand.slice(0, typedLen);
        }

        if (cliOutputRef.current) {
          cliOutputRef.current.textContent = showOutput ? currentData.out : "";
          cliOutputRef.current.style.opacity = showOutput ? `${outputOpacity}` : "0";
        }

        if (cliBadgeRef.current) {
          cliBadgeRef.current.textContent = currentData.badge;
        }

        // Sidebar active highlighting
        cliStepItemsRef.current.forEach((el, idx) => {
          if (!el) return;
          if (idx === index) {
            el.classList.add("is-active");
            el.classList.remove("is-past");
          } else if (idx < index) {
            el.classList.remove("is-active");
            el.classList.add("is-past");
          } else {
            el.classList.remove("is-active");
            el.classList.remove("is-past");
          }
        });
      };

      // Set initial state
      updateCliStep(0);

      // Pin CLI Section with ScrollTrigger
      ScrollTrigger.create({
        trigger: cliSectionRef.current,
        pin: cliPinRef.current,
        start: "top top",
        end: () =>
          window.innerWidth < 768 ? "+=1400" : "+=3000",
        scrub: 0.4,
        onUpdate: (self) => {
          updateCliStep(self.progress);
        },
      });

      // -----------------------------------------------------------------------
      // 4. PINNED REPO STORY: Tree populates, code streams, commit line, star ticks
      // -----------------------------------------------------------------------
      const repoTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: repoSectionRef.current,
          pin: repoPinRef.current,
          start: "top top",
          end: () =>
            window.innerWidth < 768 ? "+=1200" : "+=2400",
          scrub: 0.5,
        },
      });

      // Phase 1: File tree entries populate
      repoTimeline.fromTo(
        repoFileRowsRef.current.filter(Boolean),
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, stagger: 0.08, duration: 0.8, ease: "power2.out" }
      );

      // Phase 2: Selection bar highlights engine.ts
      if (repoSelectionBarRef.current) {
        repoTimeline.fromTo(
          repoSelectionBarRef.current,
          { opacity: 0, scaleX: 0.8 },
          { opacity: 1, scaleX: 1, duration: 0.4, ease: "power2.out" }
        );
      }

      // Phase 3: Code lines reveal
      repoTimeline.fromTo(
        repoCodeLinesRef.current.filter(Boolean),
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.9, ease: "power2.out" }
      );

      // Phase 4: SVG connector line draws down
      if (repoConnectorRef.current) {
        repoTimeline.to(repoConnectorRef.current, {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: "none",
        });
      }

      // Phase 5: Commit row slides in
      if (repoCommitRowRef.current) {
        repoTimeline.fromTo(
          repoCommitRowRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }
        );
      }

      // -----------------------------------------------------------------------
      // 5. 3-CARD FEATURE ROW: Stagger in with rotation + hard-shadow growing
      // -----------------------------------------------------------------------
      const cards = featureCardsRef.current.filter(Boolean);
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 70,
            rotation: (i) => (i === 0 ? -6 : i === 1 ? 4 : -5),
            boxShadow: "0px 0px 0px #000000",
          },
          {
            opacity: 1,
            y: 0,
            rotation: 0,
            boxShadow: "6px 6px 0px #000000",
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: featuresSectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // -----------------------------------------------------------------------
      // 6. STACK STRIP: Seamless marquee reacting to scroll velocity
      // -----------------------------------------------------------------------
      if (marqueeTrackRef.current) {
        const marqueeTl = gsap.to(marqueeTrackRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: 22,
          ease: "none",
        });

        // Speed responds dynamically to scroll velocity
        ScrollTrigger.create({
          onUpdate: (self) => {
            const velocity = Math.abs(self.getVelocity());
            const speedBoost = Math.min(velocity / 300, 3.5);
            gsap.to(marqueeTl, {
              timeScale: 1 + speedBoost,
              duration: 0.3,
              overwrite: "auto",
              onComplete: () => {
                gsap.to(marqueeTl, { timeScale: 1, duration: 0.8, ease: "power1.out" });
              },
            });
          },
        });
      }

      // -----------------------------------------------------------------------
      // 7. CTA SECTION: Headline scales/unskews & Yellow wipe via clip-path
      // -----------------------------------------------------------------------
      if (ctaBgRef.current) {
        gsap.fromTo(
          ctaBgRef.current,
          { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
          {
            clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
            duration: 0.8,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (ctaHeadlineRef.current) {
        gsap.fromTo(
          ctaHeadlineRef.current,
          { scale: 1.18, skewX: -7, opacity: 0 },
          {
            scale: 1,
            skewX: 0,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, landingContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={landingContainerRef}
      className="landing-page min-h-screen bg-[#0a0b10] text-gray-100 selection:bg-[#ffe600] selection:text-black"
    >
      {/* --------------------------------------------------------------------
          FIXED TOP SCROLL PROGRESS BAR
      -------------------------------------------------------------------- */}
      <div ref={progressBarRef} className="landing-scroll-progress" />

      {/* --------------------------------------------------------------------
          STICKY HEADER
      -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#0a0b10]/95 backdrop-blur-md border-b-3 border-black px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white group">
            <div className="w-10 h-10 bg-[#ffe600] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-mono font-black group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <GitBranch className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="sharpie-font text-2xl tracking-tight text-white">
              Git<span className="text-[#ffe600]">Verse</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-mono text-xs font-bold uppercase tracking-wider">
            <a
              href="#cli-story"
              className="text-gray-300 hover:text-[#ffe600] transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-[#ffe600]" /> CLI Workflow
            </a>
            <a
              href="#repo-story"
              className="text-gray-300 hover:text-[#00f0ff] transition-colors flex items-center gap-1.5"
            >
              <Folder className="w-3.5 h-3.5 text-[#00f0ff]" /> Repo Engine
            </a>
            <a
              href="#features"
              className="text-gray-300 hover:text-[#a855f7] transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#a855f7]" /> Features
            </a>
            <a
              href="#stack"
              className="text-gray-300 hover:text-[#00ff87] transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-[#00ff87]" /> Stack
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#cli-story"
              className="neo-btn neo-btn-outline hidden sm:inline-flex text-xs py-2 px-3"
            >
              <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" /> CLI Quickstart
            </a>
            <Link to="/auth" className="neo-btn neo-btn-primary text-xs py-2 px-4">
              <User className="w-4 h-4" /> Open Web App
            </Link>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          1. HERO SECTION: Word-by-word reveal, sticker badges & parallax
      -------------------------------------------------------------------- */}
      <section
        ref={heroRef}
        className="relative pt-12 pb-20 px-4 lg:px-8 border-b-3 border-black bg-gradient-to-b from-[#0a0b10] to-[#111320] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div ref={heroBadgesRef} className="flex flex-wrap items-center gap-3">
              <span className="neo-badge bg-[#ff007f] text-white -rotate-2">
                <Zap className="w-3.5 h-3.5 fill-current" /> HEADLESS REPO ENGINE
              </span>
              <span className="neo-badge bg-[#00ff87] text-black rotate-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> TOKEN IN ~/.gitv/config.json
              </span>
              <span className="neo-badge bg-[#a855f7] text-white -rotate-1">
                <Code2 className="w-3.5 h-3.5" /> MONGODB COMMIT BLOBS
              </span>
            </div>

            {/* Headline with word-by-word masked reveal */}
            <h1
              ref={heroHeadlineRef}
              className="sharpie-font text-4xl sm:text-6xl lg:text-7xl text-white leading-[1.08] tracking-tight uppercase"
            >
              {["HOST", "CODE", "ONLINE.", "PUSH", "WITH", "CUSTOM", "gitv", "CLI."].map(
                (word, i) => (
                  <span key={i} className="hero-word-wrap">
                    <span
                      className={`hero-word ${word === "gitv"
                        ? "text-[#ffe600] underline decoration-4 decoration-[#00f0ff]"
                        : ""
                        }`}
                    >
                      {word}
                    </span>
                  </span>
                )
              )}
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              GitVerse seamlessly pairs a high-performance web interface with a custom
              headless Node.js CLI. Manage repositories, commit files directly into
              cloud clusters, inspect syntax trees live, and sync developer authentication
              effortlessly.
            </p>

            {/* Hero CTA Buttons */}
            <div ref={heroButtonsRef} className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/auth" className="neo-btn neo-btn-primary text-sm px-6 py-3.5">
                <User className="w-4 h-4" /> Open Web App <ChevronRight className="w-4 h-4" />
              </Link>
              <a
                href="#cli-story"
                className="neo-btn neo-btn-purple text-sm px-6 py-3.5"
              >
                <Terminal className="w-4 h-4" /> Scroll CLI Story
              </a>
            </div>
          </div>

          {/* Hero Right Column: Neobrutalist Illustrated Hero Scene */}
          <div
            className="lg:col-span-5 w-full flex items-center justify-center max-w-[560px] lg:max-w-none mx-auto"
            ref={heroCardRef}
          >
            <HeroScene />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          2. PINNED CLI STORY (~300vh pin, types/un-types via scroll)
      -------------------------------------------------------------------- */}
      <section
        id="cli-story"
        ref={cliSectionRef}
        className="relative border-b-3 border-black bg-[#0a0b10]"
      >
        <div
          ref={cliPinRef}
          className="w-full min-h-screen flex flex-col justify-center py-12 px-4 lg:px-8 max-w-7xl mx-auto"
        >
          {/* Section Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="neo-badge bg-[#ffe600] text-black">
                <Terminal className="w-3.5 h-3.5" /> HEADLESS DEVELOPER LIFECYCLE
              </span>
              <span className="font-mono text-xs text-gray-400 hidden sm:inline-block">
                SCROLL TO SCRUB TIMELINE
              </span>
            </div>
            <h2 className="sharpie-font text-3xl sm:text-5xl text-white uppercase">
              The <span className="text-[#ffe600]">gitv CLI</span> Story
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl font-mono mt-1">
              Scroll down to watch commands type out, authenticate, stage blobs, and push
              commits directly to remote cloud clusters.
            </p>
          </div>

          {/* Main 2-Column CLI Viewer */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left: Compact command step list that lights up */}
            <div className="lg:col-span-4 flex flex-col gap-2 font-mono text-xs">
              {CLI_STEPS.map((s, idx) => (
                <div
                  key={s.step}
                  ref={(el) => (cliStepItemsRef.current[idx] = el)}
                  className="cli-step-item p-3 flex items-center justify-between border-2 select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[10px] opacity-75">{s.step}</span>
                    <span className="font-bold text-sm">
                      {s.cmd} {s.args ? <span className="opacity-70">{s.args}</span> : null}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: Distinctive Fake Terminal with Caret & Output */}
            <div className="lg:col-span-8">
              <div className="neo-box-yellow bg-[#0d0f1a] relative overflow-hidden">
                {/* Terminal Header */}
                <div className="bg-[#141724] px-4 py-3 border-b-3 border-black flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#ff5c6c] border border-black inline-block" />
                    <span className="w-3 h-3 bg-[#ffe600] border border-black inline-block" />
                    <span className="w-3 h-3 bg-[#00ff87] border border-black inline-block" />
                    <span className="font-mono text-xs text-gray-300 ml-2 font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#ffe600]" />
                      gitv-terminal ~ zsh (80x24)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      ref={cliBadgeRef}
                      className="neo-badge bg-[#ffe600] text-black text-[10px] py-0.5 px-2"
                    >
                      AUTH READY
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCmd}
                      title="Copy active command"
                      className="neo-btn neo-btn-outline text-[10px] py-1 px-2.5"
                    >
                      {copiedCli ? (
                        <>
                          <Check className="w-3 h-3 text-[#00ff87]" /> COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> COPY
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Terminal Body */}
                <div className="p-6 font-mono text-sm sm:text-base leading-relaxed min-h-[320px] flex flex-col justify-between">
                  <div>
                    {/* Command Prompt Row */}
                    <div className="flex items-center gap-2 text-white font-bold">
                      <span className="text-[#00ff87] select-none">$</span>
                      <span
                        ref={cliCmdTextRef}
                        className="text-[#ffe600] tracking-wide"
                      >
                        gitv login
                      </span>
                      <span className="blinking-caret">▌</span>
                    </div>

                    {/* Output Block */}
                    <div
                      ref={cliOutputRef}
                      className="mt-4 pt-4 border-t border-[#1f2438] text-gray-300 whitespace-pre-line text-xs sm:text-sm font-medium leading-loose"
                      style={{ transition: "opacity 0.15s ease" }}
                    >
                      {CLI_STEPS[0].out}
                    </div>
                  </div>

                  {/* Terminal Bottom Bar */}
                  <div className="pt-6 border-t border-[#1a1d2e] flex flex-wrap items-center justify-between text-[11px] text-gray-500 font-mono">
                    <span>
                      Active Config: <code className="text-gray-300">~/.gitv/config.json</code>
                    </span>
                    <span>REST / Socket.io Engine Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          3. PINNED REPO STORY: Tree populates, code streams, commit line, star
      -------------------------------------------------------------------- */}
      <section
        id="repo-story"
        ref={repoSectionRef}
        className="relative border-b-3 border-black bg-[#0c0e18]"
      >
        <div
          ref={repoPinRef}
          className="w-full min-h-screen flex flex-col justify-center py-12 px-4 lg:px-8 max-w-7xl mx-auto"
        >
          {/* Section Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="neo-badge bg-[#00f0ff] text-black">
                <Folder className="w-3.5 h-3.5" /> REPOSITORY WORKSPACE
              </span>
              <span className="font-mono text-xs text-gray-400 hidden sm:inline-block">
                SCROLL TO EXPLORE TREE & COMMITS
              </span>
            </div>
            <h2 className="sharpie-font text-3xl sm:text-5xl text-white uppercase">
              Live Workspace & Commit Graph
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl font-mono mt-1">
              Watch files populate, syntax trees stream in, commit history links, and
              stars tick in real time—driven purely by scroll progress.
            </p>
          </div>

          {/* Repo Window Card */}
          <div className="neo-box-cyan bg-[#0f111e] overflow-hidden">
            {/* Repo Header Bar */}
            <div className="bg-[#141727] px-4 sm:px-6 py-3.5 border-b-3 border-black flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#00f0ff] border-2 border-black flex items-center justify-center text-black font-bold">
                  <Code2 className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="font-mono">
                  <span className="text-gray-400 text-xs">dev_mahesh / </span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    hyperscale-core
                  </span>
                </div>
                <span className="neo-badge bg-[#a855f7] text-white text-[10px] py-0.5 px-2">
                  TypeScript
                </span>
                <span className="neo-badge bg-[#ffe600] text-black text-[10px] py-0.5 px-2">
                  main
                </span>
              </div>
            </div>

            {/* Split Content: File Tree (Left) & Code Preview + Commit Row (Right) */}
            <div className="grid lg:grid-cols-12 min-h-[380px]">
              {/* File Tree Column */}
              <div className="lg:col-span-4 border-r-3 border-black bg-[#0d0f1a] p-4 font-mono text-xs flex flex-col justify-between">
                <div>
                  <div className="text-gray-400 font-bold uppercase text-[11px] mb-3 pb-2 border-b border-[#22273d] flex items-center justify-between">
                    <span>EXPLORER</span>
                    <span className="text-[#a855f7]">6 ITEMS</span>
                  </div>

                  <div className="space-y-1">
                    {REPO_FILES.map((f, i) => (
                      <div
                        key={f.name}
                        ref={(el) => (repoFileRowsRef.current[i] = el)}
                        className={`file-tree-row p-2 flex items-center gap-2 ${f.active ? "selected" : "text-gray-300 hover:bg-[#161a2c]"
                          }`}
                        style={{ paddingLeft: f.indent ? "1.5rem" : "0.5rem" }}
                      >
                        {f.isFolder ? (
                          <Folder className="w-3.5 h-3.5 text-[#ffe600]" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
                        )}
                        <span>{f.name}</span>
                        {f.active && (
                          <span
                            ref={repoSelectionBarRef}
                            className="ml-auto text-[9px] bg-black text-[#ffe600] px-1 py-0.2 font-bold"
                          >
                            SELECTED
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1c2033] text-[11px] text-gray-500">
                  <span>Blob Storage: MongoDB GridFS Engine</span>
                </div>
              </div>

              {/* Code Preview & Commit History Column */}
              <div className="lg:col-span-8 p-4 sm:p-6 bg-[#0f111e] flex flex-col justify-between">
                {/* File Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1f243b]">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-[#00f0ff] font-bold">src/engine.ts</span>
                      <span className="text-gray-500">· 8 lines</span>
                    </div>
                    <span className="font-mono text-[11px] text-gray-400">
                      TypeScript 5.4
                    </span>
                  </div>

                  {/* Code Lines Preview */}
                  <div className="font-mono text-xs sm:text-sm space-y-1.5 leading-relaxed bg-[#0b0c14] p-4 border border-[#20253b]">
                    {CODE_LINES.map((line, idx) => (
                      <div
                        key={idx}
                        ref={(el) => (repoCodeLinesRef.current[idx] = el)}
                        className="flex items-start gap-4"
                      >
                        <span className="text-gray-600 select-none w-5 text-right text-xs">
                          {idx + 1}
                        </span>
                        <span
                          className={
                            line.startsWith("//")
                              ? "text-gray-500 italic"
                              : line.includes("export async function")
                                ? "text-[#00f0ff] font-bold"
                                : line.includes("createCluster") || line.includes("BlobStorage")
                                  ? "text-[#ffe600]"
                                  : "text-gray-200"
                          }
                        >
                          {line || "\u00A0"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SVG Drawn Connector Line & Commit Row */}
                <div className="mt-6 pt-4 border-t border-[#1f243b] relative">
                  {/* SVG Drawn Connector Line */}
                  <div className="flex items-center gap-3">
                    <svg
                      width="20"
                      height="32"
                      className="overflow-visible"
                      viewBox="0 0 20 32"
                    >
                      <path
                        ref={repoConnectorRef}
                        d="M 10 0 L 10 32"
                        stroke="#00ff87"
                        strokeWidth="3"
                        fill="none"
                        className="commit-connector-line"
                      />
                    </svg>
                    <span className="font-mono text-xs text-gray-400 uppercase font-bold">
                      Snapshot Commit Row
                    </span>
                  </div>

                  {/* Commit Row Entry */}
                  <div
                    ref={repoCommitRowRef}
                    className="mt-2 p-3 bg-[#131626] border-2 border-black shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#00ff87] border border-black flex items-center justify-center text-black font-bold">
                        <GitCommit className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="font-mono">
                        <div className="text-white font-bold text-xs">
                          feat: real-time streaming engine
                        </div>
                        <div className="text-gray-400 text-[10px]">
                          commit <span className="text-[#ffe600]">e83f12a</span> by{" "}
                          <span className="text-gray-200">dev_mahesh</span> · just now
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="neo-badge bg-[#00ff87] text-black text-[10px] py-0.5 px-2">
                        +542 -0
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4. 3-CARD FEATURE ROW (Max ~1 sentence per card, hard shadow, tilt)
      -------------------------------------------------------------------- */}
      <section
        id="features"
        ref={featuresSectionRef}
        className="py-20 px-4 lg:px-8 border-b-3 border-black bg-[#0a0b10]"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <span className="neo-badge bg-[#a855f7] text-white mb-3">
              <Zap className="w-3.5 h-3.5" /> ARCHITECTED FOR SPEED
            </span>
            <h2 className="sharpie-font text-3xl sm:text-5xl text-white uppercase">
              Engineered for Modern Teams
            </h2>
            <p className="text-gray-400 font-mono text-xs sm:text-sm mt-2">
              Three core pillars power GitVerse from local terminal to remote cluster.
            </p>
          </div>

          {/* 3 Distinct Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Neon Yellow */}
            <div
              ref={(el) => (featureCardsRef.current[0] = el)}
              className="neo-box-yellow p-6 feature-tilt-card flex flex-col justify-between bg-[#111422]"
            >
              <div>
                <div className="w-12 h-12 bg-[#ffe600] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-black mb-5">
                  <Terminal className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="neo-badge bg-[#ffe600] text-black text-[10px] mb-3">
                  HEADLESS CLI
                </span>
                <h3 className="sharpie-font text-xl text-white mb-2">
                  Push From Any Terminal
                </h3>
                <p className="text-gray-300 text-sm font-sans leading-relaxed">
                  Sync local workspaces directly to GitVerse cloud clusters via native gitv
                  commands without third-party dependencies.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1f243b] font-mono text-xs text-[#ffe600] font-bold flex items-center gap-1">
                Zero Configuration <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Neon Cyan */}
            <div
              ref={(el) => (featureCardsRef.current[1] = el)}
              className="neo-box-cyan p-6 feature-tilt-card flex flex-col justify-between bg-[#111422]"
            >
              <div>
                <div className="w-12 h-12 bg-[#00f0ff] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-black mb-5">
                  <Code2 className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="neo-badge bg-[#00f0ff] text-black text-[10px] mb-3">
                  COMMIT SNAPSHOTS
                </span>
                <h3 className="sharpie-font text-xl text-white mb-2">
                  Live Tree Reconstruction
                </h3>
                <p className="text-gray-300 text-sm font-sans leading-relaxed">
                  Inspect and preview historical source files reconstructed on-the-fly
                  directly from MongoDB blob commit snapshots.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1f243b] font-mono text-xs text-[#00f0ff] font-bold flex items-center gap-1">
                Instant Diff Inspection <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Neon Purple */}
            <div
              ref={(el) => (featureCardsRef.current[2] = el)}
              className="neo-box-purple p-6 feature-tilt-card flex flex-col justify-between bg-[#111422]"
            >
              <div>
                <div className="w-12 h-12 bg-[#a855f7] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-white font-black mb-5">
                  <Shield className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="neo-badge bg-[#a855f7] text-white text-[10px] mb-3">
                  TOKEN SECURITY
                </span>
                <h3 className="sharpie-font text-xl text-white mb-2">
                  Scoped Bearer Security
                </h3>
                <p className="text-gray-300 text-sm font-sans leading-relaxed">
                  Authenticate once via Web OAuth and sign CLI pushes automatically using
                  scoped bearer tokens stored in ~/.gitv/config.json.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1f243b] font-mono text-xs text-[#a855f7] font-bold flex items-center gap-1">
                Cryptographic Signature <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. STACK STRIP: Seamless infinite marquee reacting to scroll velocity
      -------------------------------------------------------------------- */}
      <section
        id="stack"
        className="py-8 bg-[#0a0b10] border-b-3 border-black overflow-hidden select-none"
      >
        <div className="relative w-full">
          {/* Double item list for infinite seamless loop */}
          <div ref={marqueeTrackRef} className="marquee-track">
            {[...STACK_ITEMS, ...STACK_ITEMS, ...STACK_ITEMS].map((item, idx) => {
              const pillColors = ["#ffe600", "#00f0ff", "#a855f7", "#ff007f", "#00ff87"];
              return (
                <div key={idx} className="marquee-pill">
                  <span
                    className="w-2.5 h-2.5 border border-black inline-block"
                    style={{ backgroundColor: pillColors[idx % pillColors.length] }}
                  />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          6. CTA SECTION: Giant headline scales/unskews & Yellow wipe clip-path
      -------------------------------------------------------------------- */}
      <section
        ref={ctaSectionRef}
        className="relative py-24 px-4 lg:px-8 border-b-3 border-black bg-[#0d0f1a] overflow-hidden"
      >
        {/* Yellow Wipe Background Element */}
        <div
          ref={ctaBgRef}
          className="cta-wipe-bg absolute inset-0 bg-[#ffe600] z-0"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <span className="neo-badge bg-black text-[#ffe600]">
            <Zap className="w-4 h-4 text-[#ffe600]" /> READY TO HOST & PUSH?
          </span>

          <h2
            ref={ctaHeadlineRef}
            className="sharpie-font text-4xl sm:text-6xl lg:text-7xl leading-tight text-black uppercase"
          >
            SCALE AND HOST YOUR CODE ON GitVerse TODAY.
          </h2>

          <p className="font-sans font-bold text-base sm:text-lg text-black/85 max-w-xl mx-auto">
            Connect local workspaces, stream commits to cloud clusters, and experience
            the next generation of headless repository hosting.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/auth"
              className="neo-btn neo-btn-black text-sm px-8 py-4"
            >
              <User className="w-4 h-4 text-[#ffe600]" /> Create Free Account
            </Link>
            <a
              href="#cli-story"
              className="neo-btn neo-btn-purple text-sm px-8 py-4"
            >
              <Terminal className="w-4 h-4" /> Install gitv CLI
            </a>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          7. FOOTER: Exactly ONE clean footer (duplicate removed)
      -------------------------------------------------------------------- */}
      <footer className="bg-[#0a0b10] text-gray-400 py-12 px-4 lg:px-8 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-800 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffe600] border-2 border-black flex items-center justify-center text-black font-bold">
              <GitBranch className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="sharpie-font text-xl text-white">GitVerse</span>
          </div>

          <div className="flex flex-wrap gap-6 text-gray-400">
            <a href="#cli-story" className="hover:text-[#ffe600] transition-colors">
              CLI Tool
            </a>
            <a href="#repo-story" className="hover:text-[#00f0ff] transition-colors">
              Repositories
            </a>
            <a href="#features" className="hover:text-[#a855f7] transition-colors">
              Features
            </a>
            <a href="#stack" className="hover:text-[#00ff87] transition-colors">
              Tech Stack
            </a>
            <Link to="/auth" className="hover:text-[#ffe600] transition-colors">
              Web App
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00ff87] rounded-full inline-block animate-pulse" />
            <span className="text-[11px] text-gray-300 font-bold">
              All Systems Operational
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
          <div>GitVerse Repository Hosting & Headless gitv CLI Client</div>
          <div>Built with Neobrutalism Tokens • Sharpie & JetBrains Mono</div>
        </div>
      </footer>
    </div>
  );
}
