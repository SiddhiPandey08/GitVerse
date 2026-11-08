import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LandingScrollProvider } from "./landingScroll";
import { Island, IslandLip, Sphere, RepoPlanet, Moon, LogoMark } from "./landingArt";
import "./immersiveLanding.css";

gsap.registerPlugin(ScrollTrigger);

/* =========================================
   CHARACTERS
   Files in src/assets/characters are looked up by lowercase file name.
   Every person keeps one face across the page:

     arjun (owner)        owner.webp
     mei   (collaborator) collaborator.webp
     dev   (viewer)       viewer.webp
     zoya  (member)       member.webp

   Spare faces for scenes that do not name anyone:
     owner2, owner3, viewer2

   collaboratorStanding.webp is the full-length figure. It is the only
   one that stands on an island; the portraits are shown as round badges.
========================================= */

const characterAssets = Object.entries(
  import.meta.glob("../../assets/characters/*.{png,jpg,jpeg,webp,avif}", {
    eager: true,
    query: "?url",
    import: "default",
  }),
);

const charMap = {};

characterAssets.forEach(([path, url]) => {
  const base = path
    .split("/")
    .pop()
    .replace(/\.[^.]+$/, "")
    .toLowerCase();

  if (base.includes("logo")) return;

  charMap[base] = url;
});

const charKeys = Object.keys(charMap);

// Exact lookup. A missing file shows an initial instead of a wrong face.
const CANONICAL = ["owner", "collaborator", "viewer", "member", "owner2", "viewer2"];

// scenes ask for "reviewer"; use the "member" portrait for it
const ALIASES = { reviewer: "member" };
const pickChar = (name, fallback = 0) =>
  charMap[name] ??
  charMap[ALIASES[name]] ??
  charMap[charKeys[fallback % Math.max(charKeys.length, 1)]] ??
  null;
// Portraits shown around the preloader (the full-length figure is left out).
const PRELOAD_PREFERRED = [
  "owner",
  "collaborator",
  "viewer",
  "member",
  "owner2",
  "viewer2",
  "owner3",
].filter((key) => charMap[key]);

const PRELOAD_KEYS = (
  PRELOAD_PREFERRED.length
    ? PRELOAD_PREFERRED
    : charKeys.filter((key) => !key.includes("standing"))
).slice(0, 7);

/* =========================================
   CONTENT
========================================= */

const SCENES = [
  "Introduction",
  "Repositories",
  "Command line",
  "Roles",
  "Collaboration",
  "Repository chat",
  "Meetings",
  "Get started",
];

// Timeline units per scene: 0.8 fade in, 2.4 hold, 0.8 fade out. Scenes never overlap.
const SCENE = 4;
const ENTER = 0.8;
const EXIT = 0.8;

// Check these against your CLI's index.js: arguments and output text.
const CLI = "gitv";

const CLI_LINES = [
  { cmd: `${CLI} init 6ab14c22`, out: "Repository initialized and linked." },
  { cmd: `${CLI} login`, out: "Logged in successfully." },
  { cmd: `${CLI} add README.md`, out: "File added to staging." },
  { cmd: `${CLI} commit "Add roles and issues"`, out: "Commit created (1 file)" },
  { cmd: `${CLI} push`, out: "Pushed 1 commit(s)." },
];

const CLI_COMMANDS = [
  ["login", "Sign in to your account"],
  ["whoami", "See who you are signed in as"],
  ["init", "Link a folder to a repository"],
  ["add", "Stage your changes"],
  ["commit", "Save a snapshot of your work"],
  ["commit --review", "Save it and ask the owner to review"],
  ["push", "Send your commits to GitVerse"],
  ["pull", "Download the latest commits"],
  ["log", "Read the commit history"],
  ["revert", "Undo a commit"],
];

const REPO_FEATURES = [
  "Public and private",
  "Stars and search",
  "File preview and README",
  "Commit history",
  "Issues",
  "Contribution heatmap",
];

const COMMITS = [
  { who: "owner", msg: "Added roles on repo", hash: "32e0602" },
  { who: "collaborator", msg: "Chat in repo feature added", hash: "6d17e17" },
  { who: "owner", msg: "Start a call in repo", hash: "4b1b22a" },
];

const HEAT = Array.from({ length: 140 }, (_, i) => {
  const v = (i * 37 + (i >> 2) * 11) % 9;
  return v < 3 ? 0.12 : v < 5 ? 0.35 : v < 7 ? 0.65 : 1;
});

const ROLES = [
  {
    name: "Viewer",
    who: "viewer",
    tone: "cool",
    points: [
      "Reads public repositories",
      "Joins the repository chat",
      "Asks to collaborate in an issue",
    ],
  },
  {
    name: "Collaborator",
    who: "collaborator",
    tone: "warm",
    points: [
      "Pushes commits directly",
      "Requests a review on a commit",
      "Joins repository meetings",
    ],
  },
  {
    name: "Owner",
    who: "owner",
    tone: "cool",
    points: [
      "Approves collaboration requests",
      "Reviews and reverts commits",
      "Adds and removes collaborators",
    ],
  },
];

// dev is the viewer who becomes a collaborator, so he keeps one face throughout.
const FLOW = [
  {
    who: "viewer",
    title: "Ask",
    text: "A viewer opens an issue to ask for collaboration.",
  },
  {
    who: "owner",
    title: "Decide",
    text: "The owner approves it and the author becomes a collaborator.",
  },
  {
    who: "viewer",
    title: "Push",
    text: "The new collaborator pushes commits with the CLI.",
  },
  {
    who: "owner",
    title: "Review",
    text: "The owner marks the commit reviewed, or reverts it.",
  },
];

const CHANNELS = ["general", "collab-requests", "meetings"];

const MESSAGES = [
  {
    who: "viewer",
    name: "dev",
    role: "Viewer",
    text: "Found a bug in the login route. Can I send a fix?",
  },
  {
    system: true,
    text: "arjun approved the collaboration request. dev is now a collaborator.",
  },
  {
    who: "viewer",
    name: "dev",
    role: "Collaborator",
    text: "Pushed the fix and asked for a review.",
  },
  {
    who: "owner",
    name: "arjun",
    role: "Owner",
    text: "Reviewed. Looks good.",
  },
];

const CALL_TILES = [
  { who: "owner", name: "arjun", speaking: true },
  { who: "collaborator", name: "mei" },
  { who: "viewer", name: "dev" },
  { who: "member", name: "zoya" },
];

const HISTORY = [
  { title: "Sprint sync", when: "Yesterday · 4 people" },
  { title: "Code review", when: "Monday · 3 people" },
];

/* =========================================
   MAIN COMPONENT
========================================= */

export default function ImmersiveLanding() {
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef(null);
  const scrollToSceneRef = useRef(() => {});

  const onComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  // One pinned stage. A scrubbed timeline plays each scene in turn:
  // fade in, hold while its own motion plays, fade out, next scene.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const amp = reduced ? 0 : 1;
    const cleanups = [];

    const ctx = gsap.context(() => {
      const stage = root.querySelector(".gv-stage");
      const panels = gsap.utils.toArray(".gv-panel");
      const dots = gsap.utils.toArray(".gv-dots button");
      const last = panels.length - 1;

      const tl = gsap.timeline({ defaults: { ease: "none" } });

      panels.forEach((panel, index) => {
        const t = index * SCENE;
        const q = (selector) => panel.querySelectorAll(selector);
        const copy = panel.querySelector(".gv-copy");

        // ---- fade in ----
        if (index > 0) {
          tl.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: ENTER }, t);

          tl.fromTo(
            q(".gv-copy .gv-word"),
            { yPercent: 70 * amp, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.45,
              stagger: 0.06,
              ease: "power2.out",
            },
            t + 0.1,
          );

          tl.fromTo(
            q(".gv-copy p, .gv-copy .gv-chips, .gv-copy .gv-actions"),
            { y: 14 * amp, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.45,
              stagger: 0.1,
              ease: "power2.out",
            },
            t + 0.4,
          );

          tl.fromTo(
            q("[data-reveal]"),
            { y: 22 * amp, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.55,
              stagger: 0.12,
              ease: "power2.out",
            },
            t + 0.5,
          );
        }

        // ---- scene-specific motion during the hold ----
        if (index === 1) {
          tl.fromTo(
            q(".gv-repos__planet"),
            { scale: 0.88 },
            { scale: 1, duration: 2, ease: "power1.out" },
            t + 0.4,
          );

          tl.fromTo(
            q(".gv-commit"),
            { autoAlpha: 0, x: -14 * amp },
            { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.25, ease: "power2.out" },
            t + 1.1,
          );

          tl.fromTo(
            q(".gv-heat i"),
            { opacity: 0.1 },
            {
              opacity: (_, el) => parseFloat(el.dataset.o),
              duration: 0.3,
              stagger: { each: 0.012 },
            },
            t + 1.2,
          );
        }

        if (index === 2) {
          let cursor = t + 0.9;

          q(".gv-tline").forEach((line) => {
            const typed = line.querySelector("[data-type]");
            const output = line.querySelector("[data-out]");
            const text = typed.dataset.type;
            const progress = { n: 0 };
            const duration = Math.max(0.18, text.length * 0.014);

            tl.to(
              progress,
              {
                n: text.length,
                duration,
                ease: "none",
                onUpdate: () => {
                  typed.textContent = text.slice(0, Math.round(progress.n));
                },
              },
              cursor,
            );

            cursor += duration;

            if (output) {
              tl.fromTo(
                output,
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.1 },
                cursor,
              );
              cursor += 0.1;
            }

            cursor += 0.06;
          });

          // The command list is the point of this scene, so it appears first.
          tl.fromTo(
            q(".gv-cmd"),
            { autoAlpha: 0, x: 14 * amp },
            { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.09, ease: "power2.out" },
            t + 0.6,
          );
        }

        if (index === 3) {
          tl.fromTo(
            q(".gv-role li"),
            { autoAlpha: 0, x: -10 * amp },
            { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.1, ease: "power2.out" },
            t + 1.2,
          );
        }

        if (index === 4) {
          tl.fromTo(
            q(".gv-flow__fill"),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.8 },
            t + 1.0,
          );

          q(".gv-step").forEach((step, k) => {
            const at = t + 0.9 + k * 0.55;

            tl.fromTo(step, { autoAlpha: 0.3 }, { autoAlpha: 1, duration: 0.35 }, at);

            tl.fromTo(
              step.querySelector(".gv-medal"),
              { scale: 0.9, borderColor: "#38458f" },
              { scale: 1, borderColor: "#a99bff", duration: 0.35, ease: "back.out(2)" },
              at,
            );
          });
        }

        if (index === 5) {
          tl.fromTo(
            q(".gv-msg"),
            { autoAlpha: 0, y: 14 * amp },
            { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.5, ease: "power2.out" },
            t + 1.0,
          );
        }

        if (index === 6) {
          tl.fromTo(
            q(".gv-history li"),
            { autoAlpha: 0, x: 14 * amp },
            { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.25, ease: "power2.out" },
            t + 1.3,
          );
        }

        if (index === 7) {
          tl.fromTo(
            q(".gv-layer"),
            { scale: 0.88 },
            { scale: 1, duration: 1.4, stagger: 0.15, ease: "power2.out" },
            t + 0.3,
          );
        }

        // ---- depth: every layer drifts at its own speed ----
        q("[data-depth]").forEach((layer) => {
          const depth = parseFloat(layer.dataset.depth) * amp;

          tl.fromTo(
            layer,
            { yPercent: index === 0 ? 0 : 7 * depth },
            { yPercent: -7 * depth, duration: SCENE },
            t,
          );
        });

        // ---- fade out ----
        if (index < last) {
          tl.to(panel, { autoAlpha: 0, duration: EXIT }, t + SCENE - EXIT);
          tl.to(
            copy,
            { y: -20 * amp, duration: EXIT, ease: "power2.in" },
            t + SCENE - EXIT,
          );
        }
      });

      tl.to(".gv-chevron", { autoAlpha: 0, duration: 0.5 }, 0.2);

      // Make the timeline exactly one SCENE per panel long.
      tl.to({}, { duration: 0 }, panels.length * SCENE);

      const total = tl.duration();
      const centers = panels.map((_, index) => (index * SCENE + SCENE / 2) / total);

      let active = -1;

      const setActive = (progress) => {
        const index = Math.min(
          last,
          Math.max(0, Math.floor((progress * total) / SCENE)),
        );

        if (index === active) return;
        active = index;

        dots.forEach((dot, k) => {
          dot.classList.toggle("is-filled", k <= index);
          dot.classList.toggle("is-current", k === index);
          dot.setAttribute("aria-current", k === index ? "true" : "false");
        });
      };

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${panels.length * window.innerHeight * 1.1}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tl,
        snap: reduced
          ? false
          : {
              snapTo: (value) =>
                centers.reduce((best, c) =>
                  Math.abs(c - value) < Math.abs(best - value) ? c : best,
                ),
              duration: { min: 0.25, max: 0.7 },
              delay: 0.1,
              ease: "power2.inOut",
            },
        onUpdate: (self) => setActive(self.progress),
      });

      setActive(0);

      scrollToSceneRef.current = (index) => {
        const top = trigger.start + centers[index] * (trigger.end - trigger.start);

        window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      };

      // ---- ambient motion ----
      if (!reduced) {
        gsap.utils.toArray(".gv-float").forEach((element, index) => {
          gsap.to(element, {
            y: index % 2 === 0 ? 10 : -10,
            duration: 3.2 + (index % 4) * 0.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: -index * 0.45,
          });
        });

        gsap.to(".gv-spin", {
          rotation: 360,
          svgOrigin: "200 200",
          duration: 80,
          repeat: -1,
          ease: "none",
        });
      }

      // ---- cursor depth (desktop only) ----
      if (fine && !reduced) {
        const movers = gsap.utils.toArray("[data-depth]").map((element) => ({
          x: gsap.quickTo(element, "x", { duration: 0.8, ease: "power3.out" }),
          y: gsap.quickTo(element, "y", { duration: 0.8, ease: "power3.out" }),
          depth: parseFloat(element.dataset.depth),
        }));

        const onMove = (event) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;

          movers.forEach((mover) => {
            mover.x(-nx * 22 * mover.depth);
            mover.y(-ny * 14 * mover.depth);
          });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onMove));
      }
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  // After the preloader: re-measure the pin and play the hero entrance once.
  useEffect(() => {
    if (!loaded) return;

    ScrollTrigger.refresh();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current;

    if (reduced || !root) return;

    const hero = root.querySelectorAll(
      ".gv-panel:first-child .gv-word, .gv-panel:first-child .gv-copy p, .gv-panel:first-child .gv-actions",
    );

    gsap.fromTo(
      hero,
      { y: 28, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.1, ease: "power3.out" },
    );

    gsap.from(root.querySelectorAll(".gv-panel:first-child .gv-float"), {
      autoAlpha: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: "power2.out",
    });
  }, [loaded]);

  return (
    <LandingScrollProvider>
      {!loaded && <Preloader onComplete={onComplete} />}

      <main className="gv-landing" ref={rootRef}>
        <StarField />

        <header className="gv-bar">
          <span className="gv-bar__brand">GitVerse</span>
          <a className="gv-bar__link" href="/login">
            Sign in
          </a>
        </header>

        <div className="gv-stage">
          {/* 1 · Introduction */}
          <section className="gv-panel" aria-label={SCENES[0]}>
            <div className="gv-copy">
              <h1 className="gv-hero-title">
                <Words text="GitVerse" />
              </h1>
              <p>Where developers find their universe.</p>

              <div className="gv-actions">
                <a className="gv-button" href="/signup">
                  Create an account
                </a>
                <button
                  type="button"
                  className="gv-link"
                  onClick={() => scrollToSceneRef.current(1)}
                >
                  See what&rsquo;s inside
                </button>
              </div>
            </div>

            <div className="gv-art">
              <Layer depth="0.4" className="gv-layer--moon">
                <Moon />
              </Layer>

              <Layer depth="0.6" className="gv-layer--hero-sphere">
                <Sphere />
              </Layer>

              <Layer depth="1.5" className="gv-layer--hero-small">
                <Perch tone="cool" who="member" />
              </Layer>

              <Layer depth="1" className="gv-layer--hero-main">
                <Perch who="collaboratorStanding" stand />
              </Layer>
            </div>
          </section>

          {/* 2 · Repositories */}
          <section className="gv-panel" aria-label={SCENES[1]}>
            <div className="gv-copy">
              <h2>
                <Words text="Your code, in one place" />
              </h2>
              <p>
                Create public or private repositories, browse and preview files, read
                the README, and keep every change in the history.
              </p>
              <ul className="gv-chips">
                {REPO_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="gv-art gv-art--repos">
              <div className="gv-card gv-card--commits" data-reveal>
                <h3>Commit history</h3>
                <ul>
                  {COMMITS.map((commit) => (
                    <li className="gv-commit" key={commit.hash}>
                      <Medal who={commit.who} className="gv-medal--sm" />
                      <span className="gv-commit__msg">{commit.msg}</span>
                      <code>{commit.hash}</code>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="gv-repos__planet" data-depth="0.5">
                <RepoPlanet />
              </div>

              <div className="gv-card gv-card--heat" data-reveal>
                <h3>Contribution activity</h3>
                <div className="gv-heat" aria-hidden="true">
                  {HEAT.map((level, i) => (
                    <i key={i} data-o={level} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3 · Command line */}
          <section className="gv-panel" aria-label={SCENES[2]}>
            <div className="gv-copy">
              <h2>
                <Words text="Work from your terminal" />
              </h2>
              <p>
                The {CLI} command line keeps your folder and GitVerse in sync, from the
                first commit to the latest push.
              </p>
            </div>

            <div className="gv-art gv-art--cli">
              <div
                className="gv-terminal"
                data-reveal
                role="img"
                aria-label={`Terminal example: ${CLI_LINES.map((l) => l.cmd).join(", ")}`}
              >
                <div className="gv-terminal__bar">
                  <i />
                  <i />
                  <i />
                </div>

                <div className="gv-terminal__body">
                  {CLI_LINES.map((line) => (
                    <div className="gv-tline" key={line.cmd}>
                      <div className="gv-tline__cmd">
                        <b>$</b>
                        <span data-type={line.cmd} />
                      </div>
                      {line.out && (
                        <div className="gv-tline__out" data-out>
                          {line.out}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="gv-tline__cmd">
                    <b>$</b>
                    <em />
                  </div>
                </div>
              </div>

              <div className="gv-card gv-card--cmds" data-reveal>
                <h3>Commands</h3>
                <ul>
                  {CLI_COMMANDS.map(([name, text]) => (
                    <li className="gv-cmd" key={name}>
                      <code>
                        <i>{CLI}</i> {name}
                      </code>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 4 · Roles */}
          <section className="gv-panel" aria-label={SCENES[3]}>
            <div className="gv-copy">
              <h2>
                <Words text="Three roles, clear permissions" />
              </h2>
              <p>
                Anyone can read a public repository. What you can change depends on your
                role.
              </p>
            </div>

            <div className="gv-art gv-art--roles">
              {ROLES.map((role) => (
                <div className="gv-role" key={role.name} data-reveal>
                  <div className="gv-role__art gv-float">
                    <Perch tone={role.tone} who={role.who} />
                  </div>
                  <h3>{role.name}</h3>
                  <ul>
                    {role.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 5 · Collaboration */}
          <section className="gv-panel" aria-label={SCENES[4]}>
            <div className="gv-copy">
              <h2>
                <Words text="From request to review" />
              </h2>
              <p>Found a bug? Here is how a fix gets in, with the owner in control.</p>
            </div>

            <div className="gv-art gv-art--flow">
              <div className="gv-flow" data-reveal>
                <div className="gv-flow__track" aria-hidden="true">
                  <div className="gv-flow__fill" />
                </div>

                {FLOW.map((step, index) => (
                  <div className="gv-step" key={step.title}>
                    <Medal who={step.who} className="gv-medal--lg" />
                    <h3>
                      {index + 1}. {step.title}
                    </h3>
                    <p>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6 · Repository chat */}
          <section className="gv-panel" aria-label={SCENES[5]}>
            <div className="gv-copy">
              <h2>
                <Words text="A chat for every repository" />
              </h2>
              <p>
                Channels keep their history, and GitVerse posts a note whenever a review
                or collaboration request happens.
              </p>
            </div>

            <div className="gv-art gv-art--chat">
              <div className="gv-chat" data-reveal>
                <aside className="gv-chat__side">
                  <h3>Channels</h3>
                  <ul>
                    {CHANNELS.map((channel) => (
                      <li
                        key={channel}
                        className={channel === "collab-requests" ? "is-active" : ""}
                      >
                        # {channel}
                      </li>
                    ))}
                  </ul>
                </aside>

                <div className="gv-chat__main">
                  <div className="gv-chat__head"># collab-requests</div>

                  <ul className="gv-chat__list">
                    {MESSAGES.map((message, index) =>
                      message.system ? (
                        <li className="gv-msg gv-msg--system" key={index}>
                          <p>{message.text}</p>
                        </li>
                      ) : (
                        <li className="gv-msg" key={index}>
                          <Medal who={message.who} className="gv-medal--sm" />
                          <div>
                            <p className="gv-msg__meta">
                              <b>{message.name}</b>
                              <span>{message.role}</span>
                            </p>
                            <p className="gv-msg__text">{message.text}</p>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>

                  <div className="gv-chat__input">Message # collab-requests</div>
                </div>
              </div>
            </div>
          </section>

          {/* 7 · Meetings */}
          <section className="gv-panel" aria-label={SCENES[6]}>
            <div className="gv-copy">
              <h2>
                <Words text="Meet without leaving the repo" />
              </h2>
              <p>
                Video calls run in your browser with camera, microphone and screen
                sharing, plus a chat inside the room. Copy the link to invite anyone.
              </p>
            </div>

            <div className="gv-art gv-art--meet">
              <div className="gv-call" data-reveal>
                <div className="gv-call__grid">
                  {CALL_TILES.map((tile) => (
                    <div
                      className={`gv-tile ${tile.speaking ? "is-speaking" : ""}`}
                      key={tile.name}
                    >
                      <Figure who={tile.who} />
                      <span>{tile.name}</span>
                    </div>
                  ))}
                </div>

                <div className="gv-call__bar" aria-hidden="true">
                  <i>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <rect
                        x="9"
                        y="3"
                        width="6"
                        height="11"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M5 11a7 7 0 0 0 14 0M12 18v3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </i>
                  <i>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <rect
                        x="3"
                        y="6"
                        width="12"
                        height="12"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M15 11l6-3v8l-6-3z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </i>
                  <i>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="12"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M12 13V8m-2.5 2.5L12 8l2.5 2.5M8 20h8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </i>
                  <i className="is-end">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                      <path
                        d="M4 14c4-4 12-4 16 0l-2.5 2.5-3-1.5v-2a9 9 0 0 0-5 0v2l-3 1.5z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </i>
                </div>
              </div>

              <div className="gv-card gv-card--history" data-reveal>
                <h3>Meeting history</h3>
                <ul className="gv-history">
                  {HISTORY.map((meeting) => (
                    <li key={meeting.title}>
                      <div>
                        <b>{meeting.title}</b>
                        <span>{meeting.when}</span>
                      </div>
                      <em>Copy link</em>
                    </li>
                  ))}
                </ul>
                <p className="gv-card__note">
                  Spotlight a speaker or switch the layout during the call.
                </p>
              </div>
            </div>
          </section>

          {/* 8 · Get started */}
          <section className="gv-panel" aria-label={SCENES[7]}>
            <div className="gv-copy">
              <h2>
                <Words text="Start your first repository" />
              </h2>
              <p>
                Create an account, push your first commit, and invite someone to take a
                look.
              </p>

              <div className="gv-actions">
                <a className="gv-button" href="/signup">
                  Create an account
                </a>
                <a className="gv-link" href="/explore">
                  Browse public repositories
                </a>
              </div>
            </div>

            <div className="gv-art">
              <Layer depth="0.5" className="gv-layer--rise-planet">
                <Sphere />
              </Layer>

              <Layer depth="1.4" className="gv-layer--rise-left">
                <Perch tone="cool" who="viewer2" />
              </Layer>

              <Layer depth="1" className="gv-layer--rise-right">
                <Perch who="collaboratorStanding" stand />
              </Layer>

              <Layer depth="1.7" className="gv-layer--rise-medal-a">
                <Medal who="owner3" />
              </Layer>

              <Layer depth="1.2" className="gv-layer--rise-medal-b">
                <Medal who="owner2" />
              </Layer>
            </div>
          </section>
        </div>

        <nav className="gv-dots" aria-label="Scenes">
          {SCENES.map((name, index) => (
            <button
              type="button"
              key={name}
              aria-label={`Go to ${name}`}
              data-label={name}
              onClick={() => scrollToSceneRef.current(index)}
            >
              <span />
            </button>
          ))}
        </nav>

        <div className="gv-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M5 9l7 7 7-7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </main>
    </LandingScrollProvider>
  );
}

/* =========================================
   SMALL BUILDING BLOCKS
========================================= */

// Splits a heading into words so each one can be revealed separately.
function Words({ text }) {
  const words = text.split(" ");

  return words.map((word, index) => (
    <span key={index}>
      <span className="gv-word">{word}</span>
      {index < words.length - 1 ? " " : ""}
    </span>
  ));
}

// A layer is moved by the scroll timeline and the pointer (data-depth).
// Its inner .gv-float drifts on its own, so the motions never fight.
function Layer({ depth, className, children }) {
  return (
    <div className={`gv-layer ${className}`} data-depth={depth}>
      <div className="gv-float">{children}</div>
    </div>
  );
}

function Figure({ who, className = "" }) {
  const src = pickChar(who);

  if (!src) {
    return (
      <span className={`gv-figure gv-figure--empty ${className}`}>
        {who.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img className={`gv-figure ${className}`} src={src} alt="" draggable="false" />
  );
}

// A round portrait. Used for chat avatars, steps and floating faces.
function Medal({ who, className = "" }) {
  return (
    <div className={`gv-medal ${className}`}>
      <Figure who={who} />
    </div>
  );
}

// An island with a character on it.
//  stand  : the full-length figure stands on the grass, in front of the rock
//           and behind the front lip.
//  default: a round portrait hovers above the island like a map pin.
function Perch({ tone = "warm", who, stand = false }) {
  return (
    <div className="gv-perch">
      <Island tone={tone} />

      {stand ? (
        <Figure who={who} className="gv-perch__figure gv-perch__figure--stand" />
      ) : (
        <Medal who={who} className="gv-perch__badge" />
      )}

      <IslandLip />
    </div>
  );
}

/* =========================================
   PRELOADER
   Real progress (fonts + character images), at least 1.2s on screen,
   never longer than 6s, safe against React StrictMode.
========================================= */

function Preloader({ onComplete }) {
  const overlayRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return undefined;

    document.body.classList.add("landing-loading");

    let cancelled = false;
    const bar = { value: 0 };

    const render = () => {
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${bar.value / 100})`;
      }
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pl-center, .pl-char, .pl-title, .pl-track",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power2.out" },
      );

      gsap.to(".pl-char__in", {
        y: (index) => (index % 2 === 0 ? -8 : 8),
        duration: (index) => 2.2 + index * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, overlay);

    const sources = PRELOAD_KEYS.map((key) => charMap[key]);
    const totalSteps = sources.length + 1;
    let doneSteps = 0;

    const advance = () => {
      doneSteps += 1;

      if (cancelled) return;

      gsap.to(bar, {
        value: Math.min(92, (doneSteps / totalSteps) * 100),
        duration: 0.5,
        ease: "power1.out",
        overwrite: true,
        onUpdate: render,
      });
    };

    const loadImage = (src) =>
      new Promise((resolve) => {
        let finished = false;

        const finish = () => {
          if (finished) return;
          finished = true;
          advance();
          resolve();
        };

        const image = new Image();
        image.onload = finish;
        image.onerror = finish;
        image.src = src;

        if (image.complete) finish();
      });

    const fontsReady = Promise.resolve(document.fonts?.ready).then(advance);

    const run = async () => {
      const started = performance.now();

      await Promise.race([
        Promise.all([...sources.map(loadImage), fontsReady]),
        wait(6000),
      ]);

      if (cancelled) return;

      await wait(Math.max(0, 1200 - (performance.now() - started)));

      if (cancelled) return;

      await new Promise((resolve) => {
        gsap.to(bar, {
          value: 100,
          duration: 0.4,
          ease: "power1.out",
          overwrite: true,
          onUpdate: render,
          onComplete: resolve,
        });
      });

      if (cancelled) return;

      ctx.add(() => {
        gsap
          .timeline({
            onComplete: () => {
              if (cancelled) return;
              document.body.classList.remove("landing-loading");
              onComplete();
            },
          })
          .to(".pl-content", { autoAlpha: 0, y: -10, duration: 0.4, ease: "power2.in" })
          .to(overlay, { autoAlpha: 0, duration: 0.6, ease: "power1.inOut" });
      });
    };

    run();

    return () => {
      cancelled = true;
      gsap.killTweensOf(bar);
      ctx.revert();
      document.body.classList.remove("landing-loading");
    };
  }, [onComplete]);

  return (
    <div className="pl-overlay" ref={overlayRef}>
      <div className="pl-content">
        <div className="pl-artwork">
          <div className="pl-ring" />

          <div className="pl-center">
            <LogoMark className="pl-logo" />
          </div>

          {PRELOAD_KEYS.map((key, index) => {
            const angle = (-90 + index * (360 / PRELOAD_KEYS.length)) * (Math.PI / 180);

            return (
              <div
                className="pl-char"
                key={key}
                style={{
                  left: `${50 + 40 * Math.cos(angle)}%`,
                  top: `${50 + 40 * Math.sin(angle)}%`,
                }}
              >
                <div className="pl-char__in">
                  <img src={charMap[key]} alt="" draggable="false" />
                </div>
              </div>
            );
          })}
        </div>

        <h1 className="pl-title">GitVerse</h1>

        <div className="pl-track" aria-hidden="true">
          <div className="pl-track__fill" ref={fillRef} />
        </div>
      </div>
    </div>
  );
}

/* =========================================
   STAR FIELD
   One canvas behind everything. Stars twinkle, drift with scroll at three
   depths, stretch into streaks when you scroll fast, and now and then a
   shooting star crosses.
========================================= */

function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stars = [];
    const mouse = { x: 0 };

    let width = 0;
    let height = 0;
    let frame = 0;
    let resizeTimer;
    let shootingStar = null;
    let lastScroll = window.scrollY;
    let velocity = 0;

    let nextShoot = 8000 + Math.random() * 7000;

    const starCount = window.innerWidth < 700 ? 150 : 350;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (!stars.length) {
        for (let index = 0; index < starCount; index += 1) {
          const depth = index < starCount * 0.6 ? 0 : index < starCount * 0.88 ? 1 : 2;

          stars.push({
            x: Math.random(),
            y: Math.random(),
            radius:
              depth === 0
                ? Math.random() * 0.55 + 0.2
                : depth === 1
                  ? Math.random() * 0.9 + 0.35
                  : Math.random() * 1.5 + 0.7,
            alpha: depth === 0 ? 0.25 : depth === 1 ? 0.5 : 0.85,
            rate: Math.random() * 0.002 + 0.0005,
            phase: Math.random() * Math.PI * 2,
            depth,
            sparkle: Math.random() > 0.96,
          });
        }
      }

      if (reduced) draw(0);
    };

    function draw(time = 0) {
      context.clearRect(0, 0, width, height);

      const scroll = window.scrollY;

      // Smoothed scroll speed: fast scrolling turns stars into short streaks.
      velocity += (scroll - lastScroll - velocity) * 0.18;
      lastScroll = scroll;

      const direction = velocity >= 0 ? 1 : -1;
      const speed = reduced ? 0 : Math.abs(velocity);

      stars.forEach((star) => {
        const parallax = [0.012, 0.035, 0.07][star.depth];

        const x = (star.x * width + (star.depth === 2 ? mouse.x * 8 : 0)) % width;
        const y = (star.y * height - scroll * parallax) % height;

        const drawX = x < 0 ? x + width : x;
        const drawY = y < 0 ? y + height : y;

        const twinkle = reduced
          ? 1
          : 0.7 + Math.sin(time * star.rate + star.phase) * 0.3;

        const alpha = star.alpha * twinkle;
        const streak = Math.min(speed * [0.5, 1.1, 1.8][star.depth], 70);

        if (streak > 1.5) {
          context.strokeStyle = `rgba(255,255,255,${alpha})`;
          context.lineWidth = Math.max(0.6, star.radius * 1.3);
          context.beginPath();
          context.moveTo(drawX, drawY);
          context.lineTo(drawX, drawY + direction * streak);
          context.stroke();
        } else {
          context.fillStyle = `rgba(255,255,255,${alpha})`;
          context.beginPath();
          context.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
          context.fill();
        }

        if (star.sparkle && streak <= 1.5) {
          context.strokeStyle = `rgba(255,255,255,${alpha * 0.65})`;
          context.lineWidth = 0.6;
          context.beginPath();
          context.moveTo(drawX - 5, drawY);
          context.lineTo(drawX + 5, drawY);
          context.moveTo(drawX, drawY - 5);
          context.lineTo(drawX, drawY + 5);
          context.stroke();
        }
      });

      if (!reduced && !shootingStar && time > nextShoot) {
        shootingStar = {
          x: Math.random() * width,
          y: Math.random() * height * 0.45,
          life: 0,
          angle: Math.PI / 8 + Math.random() * (Math.PI / 5),
        };

        nextShoot = time + 8000 + Math.random() * 7000;
      }

      if (shootingStar) {
        shootingStar.life += 0.035;

        const distance = shootingStar.life * 580;
        const x = shootingStar.x + Math.cos(shootingStar.angle) * distance;
        const y = shootingStar.y + Math.sin(shootingStar.angle) * distance;
        const tailX = x - Math.cos(shootingStar.angle) * 90;
        const tailY = y - Math.sin(shootingStar.angle) * 90;

        const gradient = context.createLinearGradient(tailX, tailY, x, y);
        gradient.addColorStop(0, "rgba(139,92,246,0)");
        gradient.addColorStop(1, "rgba(255,255,255,.9)");

        context.strokeStyle = gradient;
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(x, y);
        context.stroke();

        if (shootingStar.life > 1) shootingStar = null;
      }

      if (!document.hidden && !reduced) {
        frame = requestAnimationFrame(draw);
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else if (!reduced) {
        lastScroll = window.scrollY;
        frame = requestAnimationFrame(draw);
      }
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };

    const onPointer = (event) => {
      mouse.x = event.clientX / Math.max(width, 1) - 0.5;
    };

    resize();
    if (!reduced) draw(0);

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="gv-starfield" aria-hidden="true" />;
}
