import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Terminal,
  Code2,
  GitBranch,
  GitCommit,
  Shield,
  Zap,
  Cpu,
  Database,
  Check,
  ChevronRight,
  Copy,
  Star,
  CheckCircle2,
  Play,
  Layers,
  Lock,
  Globe,
  RefreshCw,
  Download,
  FileText,
  Folder,
  Search,
  User,
  Key,
  Radio,
  Calendar,
  Activity,
  Eye,
  Trash2,
  AlertCircle,
  Tag,
  Sliders,
} from "../common/icons";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');

  :root {
    --bg-dark: #0a0b10;
    --card-dark: #121420;
    --card-border: #222638;
    --neon-yellow: #ffe600;
    --neon-pink: #ff007f;
    --neon-cyan: #00f0ff;
    --neon-green: #00ff87;
    --neon-purple: #a855f7;
    --neon-orange: #ff6b00;
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
  }

  .sharpie-font {
    font-family: var(--font-display);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .mono-font {
    font-family: var(--font-code);
  }

  /* Neobrutalist UI Token Classes */
  .neo-box {
    background: var(--card-dark);
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px #000000;
    transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .neo-box-yellow {
    background: var(--card-dark);
    border: 3px solid #000000;
    box-shadow: 5px 5px 0px var(--neon-yellow);
  }

  .neo-box-cyan {
    background: var(--card-dark);
    border: 3px solid #000000;
    box-shadow: 5px 5px 0px var(--neon-cyan);
  }

  .neo-box-pink {
    background: var(--card-dark);
    border: 3px solid #000000;
    box-shadow: 5px 5px 0px var(--neon-pink);
  }

  .neo-box-green {
    background: var(--card-dark);
    border: 3px solid #000000;
    box-shadow: 5px 5px 0px var(--neon-green);
  }

  .neo-btn {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    text-transform: uppercase;
    padding: 0.75rem 1.25rem;
    border: 3px solid #000000;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.1s ease, box-shadow 0.1s ease;
    text-decoration: none;
    font-size: 0.875rem;
    user-select: none;
  }

  .neo-btn-primary {
    background-color: var(--neon-yellow);
    color: #000000;
    box-shadow: 4px 4px 0px #000000;
  }

  .neo-btn-primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000000;
  }

  .neo-btn-secondary {
    background-color: var(--neon-cyan);
    color: #000000;
    box-shadow: 4px 4px 0px #000000;
  }

  .neo-btn-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000000;
  }

  .neo-btn-pink {
    background-color: var(--neon-pink);
    color: #ffffff;
    box-shadow: 4px 4px 0px #000000;
  }

  .neo-btn-pink:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #000000;
  }

  .neo-btn-outline {
    background-color: #1a1d2e;
    color: #ffffff;
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px #000000;
  }

  .neo-btn-outline:hover {
    background-color: #262a42;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px var(--neon-cyan);
  }

  .neo-badge {
    font-family: 'Permanent Marker', cursive;
    font-size: 0.85rem;
    padding: 0.25rem 0.6rem;
    border: 2px solid #000000;
    box-shadow: 2px 2px 0px #000000;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--bg-dark);
  }
  ::-webkit-scrollbar-thumb {
    background: #2b3046;
    border: 2px solid #000000;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--neon-yellow);
  }

  /* Animations */
  .reveal-base {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .reveal-active {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }

  .animate-marquee {
    display: flex;
    width: 200%;
    animation: marquee 25s linear infinite;
  }

  .animate-marquee:hover {
    animation-play-state: paused;
  }
`;

function useInView(options = { threshold: 0.1 }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    }, options);

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return [ref, isInView];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      className={`reveal-base ${isInView ? "reveal-active" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

const TerminalBar = ({ title = "gitv terminal", color = "bg-[#181b29]" }) => (
  <div
    className={`flex items-center justify-between px-4 py-2 border-b-3 border-black ${color}`}
  >
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500 border border-black"></div>
      <div className="w-3 h-3 rounded-full bg-green-500 border border-black"></div>
    </div>
    <span className="mono-font text-xs font-bold text-gray-300 tracking-wider flex items-center gap-1.5">
      <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" /> {title}
    </span>
    <div className="w-12"></div>
  </div>
);

export default function Landing() {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState("cli-workflow");
  const [activeFeatureCategory, setActiveFeatureCategory] = useState("cli");
  const [starredState, setStarredState] = useState({
    "sera/react-query-core": true,
    "dev/gitv-engine": false,
  });
  const [previewFile, setPreviewFile] = useState("App.jsx");
  const [copiedCli, setCopiedCli] = useState("");

  // Interactive CLI State
  const [terminalStep, setTerminalStep] = useState(0);
  const cliSteps = [
    {
      cmd: "gitv login",
      out: "AUTHENTICATING via Web OAuth... Success! JWT Token stored in localStorage.",
      badge: "Bearer Auth Ready",
    },
    {
      cmd: "gitv whoami",
      out: "LOGGED IN AS: alex_dev (ID: usr_8921a)\nLinked Repos: 8 | Followers: 142 | Token: Active",
      badge: "JWT Valid",
    },
    {
      cmd: "gitv init repo_6731a90f",
      out: "Initialized GitVerse local workspace for repository [repo_6731a90f]",
      badge: "Local Folder Linked",
    },
    {
      cmd: "gitv add src/App.jsx README.md package.json",
      out: "Staged 3 files for commit.",
      badge: "3 Files Staged",
    },
    {
      cmd: "gitv commit -m 'feat: full-stack repository hosting & CLI'",
      out: "[main 7f2e1a] feat: full-stack repository hosting & CLI\nAuthor: alex_dev <alex@gitverse.dev>",
      badge: "MongoDB Commit Created",
    },
    {
      cmd: "gitv push origin main",
      out: "Pushing to remote GitVerse MongoDB cluster via REST API...\nDelta compressed 14.2 KiB\nLatest commit updated successfully!",
      badge: "Push Complete",
    },
    {
      cmd: "gitv log --oneline --n 3",
      out: "7f2e1a - feat: full-stack repository hosting & CLI (just now)\n4b9c10 - fix: auto file preview limit (<1MB)\n2a819e - initial commit from gitv init",
      badge: "History Fetched",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < cliSteps.length - 1 ? prev + 1 : 0));
    }, 3200);
    return () => clearInterval(timer);
  }, [cliSteps.length]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const copyCliCmd = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCli(cmd);
    setTimeout(() => setCopiedCli(""), 2000);
  };

  const toggleStar = (repoKey) => {
    setStarredState((prev) => ({ ...prev, [repoKey]: !prev[repoKey] }));
  };

  // Mock File system for preview simulator
  const fileData = {
    "App.jsx": `import React from 'react';\nimport { GitVerseProvider } from '@gitverse/client';\n\n// Reconstructed from MongoDB Commit History\nexport default function App() {\n  return (\n    <GitVerseProvider authHeader="Bearer localStorage.getItem('token')">\n      <Dashboard user="alex_dev" />\n    </GitVerseProvider>\n  );\n}`,
    "README.md": `# GitVerse Ecosystem\n\n## Custom Git-Style CLI Workflow\nRun \`gitv login\` to synchronize authentication state using **JWT tokens**.\n\n### Commands\n- \`gitv init <repoId>\`\n- \`gitv add <file>\`\n- \`gitv commit <message>\`\n- \`gitv push\``,
    "package.json": `{\n  "name": "@gitverse/core",\n  "version": "3.1.0",\n  "dependencies": {\n    "express": "^4.19.2",\n    "mongoose": "^8.3.1",\n    "socket.io": "^4.7.5",\n    "jsonwebtoken": "^9.0.2"\n  }\n}`,
    "server.js": `const express = require('express');\nconst mongoose = require('mongoose');\nconst socketIo = require('socket.io');\n\nconst app = express();\napp.use(express.json());\n// JWT Bearer auth middleware attached\napp.listen(8080, () => console.log("GitVerse API active on :8080"));`,
  };

  return (
    <div className="landing-page min-h-screen bg-[#0a0b10] text-gray-100 selection:bg-[#ffe600] selection:text-black">
      <style>{styles}</style>

      {/* =========================================
          HEADER / NAVIGATION
      ========================================= */}
      {}
      <header className="sticky top-0 z-50 bg-[#0a0b10]/95 backdrop-blur-md border-b-3 border-black px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-white group"
          >
            <div className="w-10 h-10 bg-[#ffe600] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center text-black font-mono font-black group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <GitBranch className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="sharpie-font text-2xl tracking-normal">
              Git<span className="text-[#ffe600]">Verse</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-7 font-mono text-xs font-bold uppercase tracking-wider">
            <a
              href="#cli"
              className="hover:text-[#ffe600] transition-colors flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5 text-[#ffe600]" /> CLI Tool
            </a>
            <a
              href="#repository"
              className="hover:text-[#00f0ff] transition-colors flex items-center gap-1"
            >
              <Folder className="w-3.5 h-3.5 text-[#00f0ff]" /> Repositories
            </a>
            <a
              href="#features"
              className="hover:text-[#00ff87] transition-colors flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5 text-[#00ff87]" /> Features
            </a>
            <a
              href="#dashboard"
              className="hover:text-[#ff007f] transition-colors flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-[#ff007f]" /> Dashboard
            </a>
            <a
              href="#techstack"
              className="hover:text-[#a855f7] transition-colors flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5 text-[#a855f7]" /> Stack
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#cli"
              className="neo-btn neo-btn-outline hidden sm:inline-flex text-xs py-2 px-3"
            >
              <Terminal className="w-4 h-4 text-[#00f0ff]" /> CLI Quickstart
            </a>
            <Link
              to="/auth"
              className="neo-btn neo-btn-primary text-xs py-2 px-4"
            >
              <User className="w-4 h-4" /> Open Web App
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================
          HERO SECTION
      ========================================= */}
      {}
      <section className="relative pt-10 pb-16 px-4 lg:px-8 border-b-3 border-black bg-gradient-to-b from-[#0a0b10] to-[#121420]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="neo-badge bg-[#ff007f] text-white">
              <Zap className="w-4 h-4 fill-current" /> FULL-STACK REPOSITORY
              HOSTING & CUSTOM CLI
            </div>

            <h1 className="sharpie-font text-4xl sm:text-6xl text-white leading-tight">
              HOST CODE ONLINE. <br />
              PUSH WITH CUSTOM{" "}
              <span className="text-[#ffe600] underline decoration-4 decoration-[#00f0ff]">
                gitv CLI
              </span>
              .
            </h1>

            <p className="text-gray-300 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              GitVerse seamlessly pairs a powerful React browser interface with
              a custom NodeJS CLI tool. Manage repositories, commit files to
              MongoDB, preview source files live, and sync CLI authentication
              instantly via JWT tokens.
            </p>

            {/* Sharpie Callout Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="neo-badge bg-[#00ff87] text-black">
                <CheckCircle2 className="w-4 h-4" /> JWT Token Persisted
              </span>
              <span className="neo-badge bg-[#00f0ff] text-black">
                <Code2 className="w-4 h-4" /> Reconstruct Files from Commits
              </span>
              <span className="neo-badge bg-[#ffe600] text-black">
                <Radio className="w-4 h-4" /> Socket.IO WebSockets Active
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to="/auth"
                className="neo-btn neo-btn-primary text-sm px-6 py-3"
              >
                <Globe className="w-4 h-4" /> Explore Web App
              </Link>
              <a
                href="#cli"
                className="neo-btn neo-btn-secondary text-sm px-6 py-3"
              >
                <Terminal className="w-4 h-4" /> Try gitv CLI Tool
              </a>
            </div>

            {/* Quick Command Snippet */}
            <div className="w-full max-w-lg bg-[#0a0b10] border-3 border-black p-3.5 shadow-[4px_4px_0px_#000] flex items-center justify-between font-mono text-xs sm:text-sm mt-2">
              <div className="flex items-center gap-2 overflow-x-auto text-gray-300">
                <span className="text-[#ff007f] font-bold">$</span>
                <span className="text-[#00ff87] font-bold">npm install -g</span>
                <span className="text-white">@gitverse/cli</span>
                <span className="text-gray-500">&&</span>
                <span className="text-[#ffe600]">gitv login</span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard("npm install -g @gitverse/cli && gitv login")
                }
                className="text-gray-400 hover:text-white p-1.5 ml-2 border border-black bg-[#1a1d2e] shrink-0"
                title="Copy Command"
              >
                {copiedCmd ? (
                  <Check className="w-4 h-4 text-[#00ff87]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Hero Right Visual: Live Interactive CLI Engine */}
          <div className="lg:col-span-5 w-full">
            <div className="neo-box-cyan rounded-none overflow-hidden bg-[#0a0b10]">
              <TerminalBar
                title="gitv CLI v3.1 — MongoDB Sync Engine"
                color="bg-[#181b29]"
              />

              <div className="p-5 font-mono text-xs space-y-3 min-h-[360px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2 mb-3">
                    <span className="flex items-center gap-1.5 text-gray-300">
                      <Folder className="w-3.5 h-3.5 text-[#ffe600]" />{" "}
                      ~/projects/my-awesome-app
                    </span>
                    <span className="text-[#00ff87] font-bold flex items-center gap-1">
                      <Activity className="w-3 h-3" /> CONNECTED
                    </span>
                  </div>

                  {/* Active Cycle Stream */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-[#ff007f] font-bold">$</span>
                      <span className="text-white font-bold">
                        {cliSteps[terminalStep].cmd}
                      </span>
                    </div>

                    <div className="p-3 bg-[#121420] border-2 border-black text-gray-300 space-y-1 rounded-none">
                      <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#00f0ff]">
                        {cliSteps[terminalStep].out}
                      </pre>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="neo-badge bg-[#ffe600] text-black text-[10px]">
                        <Tag className="w-3 h-3" />{" "}
                        {cliSteps[terminalStep].badge}
                      </span>
                      <span className="text-gray-500 text-[10px]">
                        Step {terminalStep + 1} of {cliSteps.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Controller */}
                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex gap-1">
                    {cliSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTerminalStep(i)}
                        className={`w-2.5 h-2.5 border border-black ${i === terminalStep ? "bg-[#ffe600]" : "bg-gray-700"}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setTerminalStep((prev) => (prev + 1) % cliSteps.length)
                    }
                    className="neo-btn neo-btn-outline py-1 px-2.5 text-[10px]"
                  >
                    <Play className="w-3 h-3 text-[#00ff87]" /> Step Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          TICKER BAR WITH SHARPIE ACCENTS
      ========================================= */}
      {}
      <div className="bg-[#ffe600] text-black font-mono font-black py-2.5 border-b-3 border-black overflow-hidden select-none">
        <div className="animate-marquee flex whitespace-nowrap gap-10 text-xs sm:text-sm uppercase tracking-wider items-center">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4" /> gitv CLI Integration
          </span>
          <span className="sharpie-font text-lg">*</span>
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4" /> MongoDB Commit Persistence
          </span>
          <span className="sharpie-font text-lg">*</span>
          <span className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Bearer JWT Authentication
          </span>
          <span className="sharpie-font text-lg">*</span>
          <span className="flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Live Text & Source File Previews
          </span>
          <span className="sharpie-font text-lg">*</span>
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> GFM Markdown README Renderer
          </span>
          <span className="sharpie-font text-lg">*</span>
          <span className="flex items-center gap-2">
            <Radio className="w-4 h-4" /> Socket.IO WebSockets
          </span>
          <span className="sharpie-font text-lg">*</span>
        </div>
      </div>

      {/* =========================================
          SECTION: CUSTOM gitv CLI WORKFLOW
      ========================================= */}
      {}
      <section
        id="cli"
        className="py-16 px-4 lg:px-8 border-b-3 border-black bg-[#0a0b10]"
      >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="neo-badge bg-[#00f0ff] text-black mb-2 inline-block">
                <Terminal className="w-4 h-4" /> CLI Tool Reference
              </span>
              <h2 className="sharpie-font text-3xl sm:text-5xl text-white">
                THE CUSTOM <span className="text-[#00f0ff]">gitv</span> COMMAND
                LINE CLIENT
              </h2>
              <p className="text-gray-400 mt-2 text-sm sm:text-base font-medium">
                Built with Node.js, Yargs, and Inquirer. Commands lazily load
                modules on demand for instant startup execution times.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* CLI Commands List Grid */}
            <div className="lg:col-span-7 space-y-3">
              {[
                {
                  cmd: "gitv login",
                  desc: "Authenticates user via browser token handoff and persists JWT into localStorage.",
                  category: "AUTH",
                },
                {
                  cmd: "gitv whoami",
                  desc: "Displays currently active login username, profile stats, and linked repository state.",
                  category: "AUTH",
                },
                {
                  cmd: "gitv init <repoId>",
                  desc: "Links local project folder to an existing GitVerse remote repository ID.",
                  category: "SETUP",
                },
                {
                  cmd: "gitv add <file>",
                  desc: "Stages modified local files into the pending GitVerse commit buffer.",
                  category: "STAGE",
                },
                {
                  cmd: "gitv commit <msg>",
                  desc: "Creates a signed commit object containing file snapshots and author metadata.",
                  category: "COMMIT",
                },
                {
                  cmd: "gitv push",
                  desc: "Uploads commit tree and file payload to MongoDB remote repository via REST API.",
                  category: "SYNC",
                },
                {
                  cmd: "gitv pull",
                  desc: "Fetches and reconstructs latest commit files from GitVerse remote server.",
                  category: "SYNC",
                },
                {
                  cmd: "gitv revert <commitHash>",
                  desc: "Reverts repository state back to a historical commit identifier.",
                  category: "HISTORY",
                },
                {
                  cmd: "gitv log [--oneline] [--n <count>]",
                  desc: "Prints commit history logs with author names, IDs, and timestamps.",
                  category: "HISTORY",
                },
              ].map((item, idx) => (
                <Reveal key={item.cmd} delay={idx * 0.03}>
                  <div className="neo-box p-3.5 bg-[#121420] flex items-center justify-between gap-4 hover:border-[#ffe600]">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 bg-[#181b29] border border-black flex items-center justify-center shrink-0">
                        <Terminal className="w-4 h-4 text-[#00ff87]" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-xs sm:text-sm text-[#ffe600] flex items-center gap-2">
                          <span>{item.cmd}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="neo-badge bg-[#1a1d2e] text-[#00f0ff] border-gray-700 text-[10px]">
                        {item.category}
                      </span>
                      <button
                        onClick={() => copyCliCmd(item.cmd)}
                        className="p-1.5 border border-black bg-[#181b29] hover:bg-[#ffe600] hover:text-black transition-colors"
                        title="Copy CLI command"
                      >
                        {copiedCli === item.cmd ? (
                          <Check className="w-3.5 h-3.5 text-[#00ff87]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* CLI Synchronization Highlights Card */}
            <div className="lg:col-span-5">
              <div className="neo-box-yellow p-6 bg-[#121420] space-y-6 sticky top-20">
                <div className="flex items-center justify-between">
                  <h3 className="sharpie-font text-2xl text-[#ffe600] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#ffe600]" /> CLI Architecture
                  </h3>
                  <span className="neo-badge bg-[#ff007f] text-white">
                    Yargs + Axios
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-[#0a0b10] p-4 border-2 border-black space-y-2">
                    <div className="text-gray-400 font-bold flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#00f0ff]" /> Authentication
                      Sync
                    </div>
                    <p className="text-gray-300 leading-relaxed text-[11px]">
                      Runs JWT authentication. Requests contain the standard
                      header:
                    </p>
                    <div className="bg-[#181b29] p-2 border border-black text-[#00ff87] text-[10px]">
                      Authorization: Bearer &lt;token&gt;
                    </div>
                  </div>

                  <div className="bg-[#0a0b10] p-4 border-2 border-black space-y-2">
                    <div className="text-gray-400 font-bold flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#ff007f]" /> Commit
                      File Bundler
                    </div>
                    <p className="text-gray-300 leading-relaxed text-[11px]">
                      Commits include file paths, messages, author metadata, and
                      timestamps. Files are reconstructed dynamically upon pull
                      or web browser navigation.
                    </p>
                  </div>

                  <div className="bg-[#0a0b10] p-4 border-2 border-black space-y-2">
                    <div className="text-gray-400 font-bold flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#00ff87]" /> Lazy Loading
                      Modules
                    </div>
                    <p className="text-gray-300 leading-relaxed text-[11px]">
                      Command handlers lazy-load dependencies only when invoked
                      to keep terminal responsiveness lightning fast.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Client Stack: Node.js / Yargs / Inquirer</span>
                  <span className="text-[#00ff87] font-bold">
                    Status: Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          INTERACTIVE WEB REPOSITORY SIMULATOR
      ========================================= */}
      {}
      <section
        id="repository"
        className="py-16 px-4 lg:px-8 border-b-3 border-black bg-[#121420]"
      >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="neo-badge bg-[#ffe600] text-black mb-2 inline-block">
                <Globe className="w-4 h-4" /> Web Browser Interface
              </span>
              <h2 className="sharpie-font text-3xl sm:text-5xl text-white">
                EXPLORE REPOSITORIES, COMMITS & FILE PREVIEWS
              </h2>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                Try out the repository view: browse files, view commit logs,
                inspect README markdown, and toggle stars.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="neo-box-cyan bg-[#0a0b10] overflow-hidden">
              {/* Top Repository Header Banner */}
              <div className="p-4 sm:p-6 bg-[#181b29] border-b-3 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center font-bold text-black text-lg">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to="/auth"
                        className="font-mono text-base sm:text-xl font-extrabold text-white hover:underline"
                      >
                        alex_dev / gitverse-core-engine
                      </Link>
                      <span className="neo-badge bg-[#00ff87] text-black text-[10px] py-0.5">
                        PUBLIC
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1 font-mono">
                      Full-stack repository hosting server with MongoDB commit
                      tree storage & WebSockets.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStar("sera/react-query-core")}
                    className={`neo-btn py-1.5 px-3 text-xs ${
                      starredState["sera/react-query-core"]
                        ? "neo-btn-primary"
                        : "neo-btn-outline"
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${starredState["sera/react-query-core"] ? "fill-black" : ""}`}
                    />
                    {starredState["sera/react-query-core"]
                      ? "Starred (421)"
                      : "Star (420)"}
                  </button>

                  <button className="neo-btn neo-btn-outline py-1.5 px-3 text-xs">
                    <GitBranch className="w-3.5 h-3.5 text-[#00f0ff]" /> Fork
                    (38)
                  </button>

                  <button className="neo-btn neo-btn-pink py-1.5 px-3 text-xs hidden sm:inline-flex">
                    <Lock className="w-3.5 h-3.5" /> Toggle Visibility
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center border-b-3 border-black bg-[#121420] overflow-x-auto">
                {[
                  {
                    id: "files",
                    label: "Code & Files",
                    icon: Code2,
                    badge: "4 Files",
                  },
                  {
                    id: "commits",
                    label: "Commit History",
                    icon: GitCommit,
                    badge: "28 Commits",
                  },
                  {
                    id: "readme",
                    label: "README.md",
                    icon: FileText,
                    badge: "GFM",
                  },
                  {
                    id: "settings",
                    label: "Repo Settings",
                    icon: Sliders,
                    badge: "Admin",
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3 font-mono text-xs font-bold border-r-2 border-black flex items-center gap-2 shrink-0 transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#0a0b10] text-[#ffe600] border-t-3 border-t-[#ffe600]"
                          : "text-gray-400 hover:text-white bg-[#121420]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <span className="neo-badge bg-[#181b29] text-gray-300 text-[9px] py-0 px-1 border-gray-700">
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content 1: Code & File Browser with Live Preview */}
              {activeTab === "files" && (
                <div className="grid lg:grid-cols-12 min-h-[380px]">
                  {/* Left File List */}
                  <div className="lg:col-span-4 border-r-3 border-black bg-[#121420] p-4 space-y-2">
                    <div className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Repository Files</span>
                      <span className="text-[#00ff87] text-[10px]">
                        Sorted Alphabetically
                      </span>
                    </div>

                    {Object.keys(fileData).map((fname) => (
                      <button
                        key={fname}
                        onClick={() => setPreviewFile(fname)}
                        className={`w-full text-left p-2.5 font-mono text-xs border-2 border-black flex items-center justify-between transition-all ${
                          previewFile === fname
                            ? "bg-[#ffe600] text-black font-bold shadow-[2px_2px_0px_#000]"
                            : "bg-[#0a0b10] text-gray-300 hover:bg-[#181b29]"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {fname.endsWith(".md") ? (
                            <FileText className="w-3.5 h-3.5 text-[#ff007f]" />
                          ) : (
                            <Code2 className="w-3.5 h-3.5 text-[#00f0ff]" />
                          )}
                          {fname}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ))}

                    <div className="pt-4 border-t border-gray-800 space-y-2 font-mono text-[11px] text-gray-400">
                      <div className="flex items-center gap-1.5 text-[#00ff87]">
                        <Check className="w-3.5 h-3.5" /> Text Preview Supported
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <AlertCircle className="w-3.5 h-3.5 text-[#ffe600]" />{" "}
                        Max File Preview: 1MB
                      </div>
                    </div>
                  </div>

                  {/* Right File Previewer */}
                  <div className="lg:col-span-8 bg-[#0a0b10] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3 font-mono text-xs">
                        <span className="text-gray-300 font-bold flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#00f0ff]" /> Viewing:{" "}
                          {previewFile}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="neo-badge bg-[#181b29] text-[#00ff87] text-[10px]">
                            UTF-8 Text
                          </span>
                          <button
                            onClick={() =>
                              alert(
                                `Downloading ${previewFile} from GitVerse repository...`,
                              )
                            }
                            className="neo-btn neo-btn-outline text-[10px] py-1 px-2.5"
                          >
                            <Download className="w-3 h-3 text-[#ffe600]" />{" "}
                            Direct Download
                          </button>
                        </div>
                      </div>

                      <pre className="font-mono text-xs text-gray-200 bg-[#121420] p-4 border-2 border-black overflow-x-auto leading-relaxed">
                        <code>{fileData[previewFile]}</code>
                      </pre>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between font-mono text-[11px] text-gray-500">
                      <span>Reconstructed from commit: 7f2e1a</span>
                      <span className="text-[#00ff87]">
                        No Binary Content Detected
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Commit History */}
              {activeTab === "commits" && (
                <div className="p-6 space-y-3 bg-[#0a0b10] min-h-[380px]">
                  {[
                    {
                      hash: "7f2e1a9",
                      msg: "feat: full-stack repository hosting & CLI tool",
                      author: "alex_dev",
                      time: "10 mins ago",
                      files: 3,
                    },
                    {
                      hash: "4b9c10d",
                      msg: "fix: auto file preview size validation (<1MB check)",
                      author: "sera_lead",
                      time: "2 hours ago",
                      files: 1,
                    },
                    {
                      hash: "2a819e3",
                      msg: "feat: MongoDB commit storage schema & Socket.IO events",
                      author: "alex_dev",
                      time: "1 day ago",
                      files: 5,
                    },
                    {
                      hash: "1f09c82",
                      msg: "initial commit from gitv init command",
                      author: "alex_dev",
                      time: "2 days ago",
                      files: 2,
                    },
                  ].map((c) => (
                    <div
                      key={c.hash}
                      className="neo-box p-3.5 bg-[#121420] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#ff007f] border-2 border-black flex items-center justify-center shrink-0">
                          <GitCommit className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-xs sm:text-sm text-white">
                            {c.msg}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Committed by{" "}
                            <span className="text-[#ffe600] font-bold">
                              {c.author}
                            </span>{" "}
                            • {c.time} • {c.files} files modified
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="neo-badge bg-[#181b29] text-[#00f0ff] text-[11px]">
                          {c.hash}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Content 3: README Renderer */}
              {activeTab === "readme" && (
                <div className="p-6 bg-[#0a0b10] min-h-[380px]">
                  <div className="neo-box p-6 bg-[#121420] space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-black pb-3">
                      <span className="sharpie-font text-xl text-[#ffe600] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#ffe600]" />{" "}
                        README.md (Rendered via React Markdown & Remark GFM)
                      </span>
                      <span className="neo-badge bg-[#00ff87] text-black text-[10px]">
                        GFM Supported
                      </span>
                    </div>

                    <div className="prose prose-invert max-w-none text-sm leading-relaxed space-y-3 font-sans text-gray-200">
                      <h1 className="text-2xl font-bold text-white font-mono">
                        GitVerse Engine Overview
                      </h1>
                      <p>
                        GitVerse automatically locates repository README files (
                        <code className="text-[#00f0ff]">README.md</code>,{" "}
                        <code className="text-[#00f0ff]">README.markdown</code>,{" "}
                        <code className="text-[#00f0ff]">README.txt</code>) and
                        renders full GitHub-Flavored Markdown including
                        headings, task lists, tables, and blockquotes.
                      </p>

                      <div className="bg-[#0a0b10] p-4 border-2 border-black font-mono text-xs space-y-2">
                        <div className="text-[#00ff87] font-bold">
                          // Quick Start via gitv CLI
                        </div>
                        <div className="text-gray-300">$ gitv login</div>
                        <div className="text-gray-300">
                          $ gitv init repo_6731a90f
                        </div>
                        <div className="text-gray-300">
                          $ gitv add . && gitv commit -m "initial commit"
                        </div>
                        <div className="text-[#ffe600]">$ gitv push</div>
                      </div>

                      <ul className="list-disc pl-5 space-y-1 text-xs font-mono text-gray-300">
                        <li>JWT persistent state with Bearer Headers</li>
                        <li>
                          Automated commit reconstruction for source file
                          browsing
                        </li>
                        <li>MongoDB persistence with Mongoose models</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Settings */}
              {activeTab === "settings" && (
                <div className="p-6 bg-[#0a0b10] min-h-[380px]">
                  <div className="neo-box-pink p-6 bg-[#121420] max-w-2xl mx-auto space-y-6">
                    <h3 className="sharpie-font text-2xl text-[#ff007f] flex items-center gap-2">
                      <Trash2 className="w-5 h-5" /> Danger Zone & Repo
                      Management
                    </h3>

                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between p-3 bg-[#0a0b10] border-2 border-black">
                        <div>
                          <div className="font-bold text-white">
                            Repository Visibility
                          </div>
                          <div className="text-gray-400 text-[11px]">
                            Currently Public. Toggle to Private.
                          </div>
                        </div>
                        <button className="neo-btn neo-btn-outline py-1 px-3 text-xs">
                          Toggle
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#0a0b10] border-2 border-black">
                        <div>
                          <div className="font-bold text-red-400">
                            Delete Repository
                          </div>
                          <div className="text-gray-400 text-[11px]">
                            Requires confirmation prompt before deletion.
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            confirm(
                              "Are you sure you want to delete this repository? This action cannot be undone.",
                            )
                          }
                          className="neo-btn neo-btn-pink py-1 px-3 text-xs"
                        >
                          Delete Repo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================
          FULL FEATURE GRID (CATEGORIZED TABS)
      ========================================= */}
      {}
      <section
        id="features"
        className="py-16 px-4 lg:px-8 border-b-3 border-black bg-[#0a0b10]"
      >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="neo-badge bg-[#00ff87] text-black mb-2 inline-block">
                <Layers className="w-4 h-4" /> Feature Suite
              </span>
              <h2 className="sharpie-font text-3xl sm:text-5xl text-white">
                POWERFUL FEATURES FOR BUILDERS
              </h2>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                Explore how GitVerse integrates authentication, repository
                controls, CLI commands, file previews, and real-time activity.
              </p>
            </div>
          </Reveal>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              {
                id: "cli",
                label: "gitv CLI Workflow",
                icon: Terminal,
                color: "#00f0ff",
              },
              {
                id: "repo",
                label: "Repo & Commit Engine",
                icon: Database,
                color: "#ffe600",
              },
              {
                id: "browsing",
                label: "File Preview & README",
                icon: FileText,
                color: "#ff007f",
              },
              {
                id: "auth",
                label: "Auth & User Profiles",
                icon: User,
                color: "#00ff87",
              },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeFeatureCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFeatureCategory(cat.id)}
                  className={`neo-btn text-xs py-2 px-4 transition-all ${
                    isSelected
                      ? "bg-[#ffe600] text-black"
                      : "bg-[#121420] text-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {cat.label}
                </button>
              );
            })}
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeFeatureCategory === "cli" && (
              <>
                <Reveal delay={0.05}>
                  <div className="neo-box-cyan p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#00f0ff] border-2 border-black flex items-center justify-center text-black mb-3">
                        <Key className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        CLI Login & JWT State
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Run <code className="text-[#00f0ff]">gitv login</code>{" "}
                        to authenticate directly. State is saved into{" "}
                        <code className="text-gray-300">localStorage</code> with
                        automated Bearer headers.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#00f0ff]">
                      &gt; gitv whoami command supported
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="neo-box-yellow p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center text-black mb-3">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        Local Workspace Linking
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Link any local code directory to a remote GitVerse
                        repository with{" "}
                        <code className="text-[#ffe600]">
                          gitv init &lt;repoId&gt;
                        </code>
                        .
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#ffe600]">
                      &gt; Add, Commit, Push & Pull
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="neo-box-pink p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#ff007f] border-2 border-black flex items-center justify-center text-white mb-3">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        Revert & History Log
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Inspect local logs with{" "}
                        <code className="text-[#ff007f]">--oneline</code> and{" "}
                        <code className="text-[#ff007f]">
                          --n &lt;count&gt;
                        </code>{" "}
                        filters. Revert to historical commit IDs easily.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#ff007f]">
                      &gt; Lazy-loaded Yargs CLI handlers
                    </div>
                  </div>
                </Reveal>
              </>
            )}

            {activeFeatureCategory === "repo" && (
              <>
                <Reveal delay={0.05}>
                  <div className="neo-box-green p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#00ff87] border-2 border-black flex items-center justify-center text-black mb-3">
                        <Database className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        MongoDB Commit Storage
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Commits are stored with Mongoose schemas, storing
                        message strings, timestamps, author associations, and
                        modified file trees.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#00ff87]">
                      &gt; Reverse Chronological Ordering
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="neo-box-cyan p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#00f0ff] border-2 border-black flex items-center justify-center text-black mb-3">
                        <Star className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        Optimistic Star UI
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Star and unstar repositories with instant optimistic UI
                        updates. Dedicated Starred Repositories tab on user
                        profiles.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#00f0ff]">
                      &gt; Public / Private Visibility Toggles
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="neo-box-yellow p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center text-black mb-3">
                        <Folder className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        Repository CRUD & Search
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Create new repositories via web form, filter public
                        repos by name, and display custom programming language
                        badges with colors.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#ffe600]">
                      &gt; Confirmation Modal Before Deletion
                    </div>
                  </div>
                </Reveal>
              </>
            )}

            {activeFeatureCategory === "browsing" && (
              <>
                <Reveal delay={0.05}>
                  <div className="neo-box-pink p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#ff007f] border-2 border-black flex items-center justify-center text-white mb-3">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        Dynamic File Reconstruction
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Reconstructs the latest file versions directly from
                        historical commits. Supports previews for .jsx, .ts,
                        .py, .go, .rs, .json, .yml, .sql, and .sh.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#ff007f]">
                      &gt; Binary Detection & &lt;1MB Preview Cap
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="neo-box-green p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#00ff87] border-2 border-black flex items-center justify-center text-black mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        GFM README Renderer
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Automatically locates{" "}
                        <code className="text-[#00ff87]">README.md</code> or{" "}
                        <code className="text-[#00ff87]">README.txt</code>.
                        Renders GFM markdown with headings, code blocks, task
                        lists, and tables.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#00ff87]">
                      &gt; react-markdown + remark-gfm
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="neo-box-cyan p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#00f0ff] border-2 border-black flex items-center justify-center text-black mb-3">
                        <Download className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        Direct File Download
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Download raw text files straight from the browser file
                        preview panel. Clear error overlays for expired sessions
                        or missing files.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#00f0ff]">
                      &gt; Sorted Alphabetically
                    </div>
                  </div>
                </Reveal>
              </>
            )}

            {activeFeatureCategory === "auth" && (
              <>
                <Reveal delay={0.05}>
                  <div className="neo-box-yellow p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center text-black mb-3">
                        <User className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        User Profiles & Avatars
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Full profile layout featuring avatar fallback, custom
                        bios, follower/following counts, and personal repository
                        listings.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#ffe600]">
                      &gt; Profile Editing & User Deletion
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="neo-box-pink p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#ff007f] border-2 border-black flex items-center justify-center text-white mb-3">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        JWT Authentication
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        Secure sign-up and login pipelines using bcrypt password
                        hashing and signed JSON Web Tokens passed in request
                        headers.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#ff007f]">
                      &gt; Express Middleware Route Protection
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div className="neo-box-green p-5 bg-[#121420] h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#00ff87] border-2 border-black flex items-center justify-center text-black mb-3">
                        <Activity className="w-5 h-5" />
                      </div>
                      <h3 className="font-mono font-bold text-lg text-white mb-2">
                        Contribution Heatmap
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed font-sans">
                        GitHub-style annual contribution activity grid tracking
                        commit frequency across user profile overview tabs.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-800 font-mono text-[11px] text-[#00ff87]">
                      &gt; Overview & Starred Repos Tabs
                    </div>
                  </div>
                </Reveal>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          3-COLUMN DASHBOARD & ACTIVITY PREVIEW
      ========================================= */}
      {}
      <section
        id="dashboard"
        className="py-16 px-4 lg:px-8 border-b-3 border-black bg-[#121420]"
      >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="neo-badge bg-[#ff007f] text-white mb-2 inline-block">
                <Activity className="w-4 h-4" /> Application Layout
              </span>
              <h2 className="sharpie-font text-3xl sm:text-5xl text-white">
                3-COLUMN DASHBOARD LAYOUT
              </h2>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">
                Organized workspace featuring personal repos, public search
                filtering, and upcoming tech events.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="neo-box-yellow bg-[#0a0b10] p-4 sm:p-6 grid lg:grid-cols-12 gap-6">
              {/* Column 1: Personal Repositories */}
              <div className="lg:col-span-4 bg-[#121420] p-4 border-2 border-black space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-mono font-bold text-xs text-[#ffe600] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Personal Repos (4)
                  </span>
                  <button className="neo-btn neo-btn-primary py-0.5 px-2 text-[10px]">
                    + New Repo
                  </button>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  {[
                    {
                      name: "alex_dev/gitverse-cli",
                      lang: "JavaScript",
                      color: "#f7df1e",
                      vis: "Public",
                    },
                    {
                      name: "alex_dev/mongo-commit-store",
                      lang: "TypeScript",
                      color: "#3178c6",
                      vis: "Private",
                    },
                    {
                      name: "alex_dev/react-gfm-previewer",
                      lang: "JSX",
                      color: "#61dafb",
                      vis: "Public",
                    },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="p-3 bg-[#0a0b10] border border-black hover:border-[#ffe600] space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-white text-xs">
                        <span className="truncate">{r.name}</span>
                        <span className="neo-badge bg-[#181b29] text-gray-300 text-[9px] py-0 px-1 border-gray-800">
                          {r.vis}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: r.color }}
                        ></span>
                        <span>{r.lang}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Suggested Public Repositories & Search */}
              <div className="lg:col-span-5 bg-[#121420] p-4 border-2 border-black space-y-4">
                <div className="border-b border-gray-800 pb-2 space-y-2">
                  <span className="font-mono font-bold text-xs text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-4 h-4" /> Explore Public Repositories
                  </span>

                  {/* Search Bar */}
                  <div className="bg-[#0a0b10] border border-black p-2 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filter repositories by name..."
                      className="bg-transparent text-xs font-mono text-white focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  {[
                    {
                      name: "expressjs/express-router-v5",
                      desc: "Fast minimalist web framework for node",
                      lang: "JavaScript",
                      stars: 1204,
                    },
                    {
                      name: "facebook/react-markdown-gfm",
                      desc: "React component to render markdown using remark GFM",
                      lang: "TypeScript",
                      stars: 890,
                    },
                  ].map((pr) => (
                    <div
                      key={pr.name}
                      className="p-3 bg-[#0a0b10] border border-black space-y-1.5"
                    >
                      <div className="font-bold text-[#00f0ff] text-xs flex items-center justify-between">
                        <span>{pr.name}</span>
                        <span className="text-gray-400 text-[10px] flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#ffe600]" /> {pr.stars}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] font-sans line-clamp-1">
                        {pr.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Upcoming Tech Events & Quick Links */}
              <div className="lg:col-span-3 bg-[#121420] p-4 border-2 border-black space-y-4">
                <div className="border-b border-gray-800 pb-2">
                  <span className="font-mono font-bold text-xs text-[#ff007f] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Upcoming Events
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 bg-[#0a0b10] border border-black space-y-1">
                    <div className="text-white font-bold text-[11px]">
                      Tech Meetup - 1
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      GitVerse CLI Live Q&A
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0a0b10] border border-black space-y-1">
                    <div className="text-white font-bold text-[11px]">
                      Tech Meetup - 2
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      MongoDB Commit Indexing
                    </div>
                  </div>
                </div>

                {/* Profile Heatmap Small Mock */}
                <div className="pt-2 border-t border-gray-800 space-y-2">
                  <div className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                    Contribution Activity
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 border border-black"
                        style={{
                          backgroundColor:
                            i % 7 === 0
                              ? "#00ff87"
                              : i % 3 === 0
                                ? "#ffe600"
                                : "#181b29",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================
          TECH STACK SUMMARY
      ========================================= */}
      {}
      <section
        id="techstack"
        className="py-16 px-4 lg:px-8 border-b-3 border-black bg-[#0a0b10]"
      >
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="neo-badge bg-[#a855f7] text-white mb-2 inline-block">
                <Cpu className="w-4 h-4" /> Technology Architecture
              </span>
              <h2 className="sharpie-font text-3xl sm:text-5xl text-white">
                POWERED BY MODERN WEB STANDARDS
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-center">
            {[
              {
                name: "Frontend",
                desc: "React + Vite",
                badge: "SPA",
                color: "#61dafb",
              },
              {
                name: "Backend",
                desc: "Node.js + Express",
                badge: "REST API",
                color: "#68a063",
              },
              {
                name: "Database",
                desc: "MongoDB Mongoose",
                badge: "Commits",
                color: "#47a248",
              },
              {
                name: "WebSockets",
                desc: "Socket.IO",
                badge: "Realtime",
                color: "#00f0ff",
              },
              {
                name: "CLI Tool",
                desc: "Yargs + Inquirer",
                badge: "gitv",
                color: "#ffe600",
              },
              {
                name: "Markdown",
                desc: "React Markdown GFM",
                badge: "README",
                color: "#ff007f",
              },
            ].map((st, idx) => (
              <Reveal key={st.name} delay={idx * 0.04}>
                <div className="neo-box p-4 bg-[#121420] hover:border-[#ffe600] space-y-1.5">
                  <span className="neo-badge bg-[#181b29] text-white text-[9px] border-gray-800">
                    {st.badge}
                  </span>
                  <div className="font-bold text-white text-sm">{st.name}</div>
                  <div
                    className="text-[11px] text-gray-400"
                    style={{ color: st.color }}
                  >
                    {st.desc}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          FINAL CALL TO ACTION & FOOTER
      ========================================= */}
      <footer className="bg-[#0a0b10] text-gray-400 py-10 px-4 lg:px-8 font-mono text-xs"></footer>
      {}
      <section className="py-16 px-4 lg:px-8 border-b-3 border-black bg-[#ffe600] text-black text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="neo-badge bg-black text-white">
            <Zap className="w-4 h-4 text-[#ffe600]" /> READY TO HOST & PUSH?
          </span>

          <h2 className="sharpie-font text-4xl sm:text-6xl leading-tight">
            START USING GitVerse AND THE gitv CLI TODAY!
          </h2>

          <p className="font-bold text-base max-w-xl mx-auto text-gray-900 font-sans">
            Connect local directories, create MongoDB commits, render GFM
            READMEs, and manage public/private visibility.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#cli"
              className="neo-btn neo-btn-pink text-base px-8 py-3.5"
            >
              <Terminal className="w-5 h-5" /> Install gitv CLI
            </a>
            <Link
              to="/auth"
              className="neo-btn neo-btn-outline text-base px-8 py-3.5 bg-black text-white hover:bg-gray-900"
            >
              <Globe className="w-5 h-5 text-[#00f0ff]" /> Open Web Interface
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0b10] text-gray-400 py-10 px-4 lg:px-8 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-800 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffe600] border-2 border-black flex items-center justify-center text-black font-bold">
              <GitBranch className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="sharpie-font text-xl text-white">GitVerse</span>
          </div>

          <div className="flex flex-wrap gap-6 text-gray-400">
            <a href="#cli" className="hover:text-[#ffe600]">
              gitv CLI
            </a>
            <a href="#repository" className="hover:text-[#00f0ff]">
              Repositories
            </a>
            <a href="#features" className="hover:text-[#00ff87]">
              Features
            </a>
            <Link to="/auth" className="hover:text-[#ff007f]">
              Dashboard
            </Link>
            <a href="#techstack" className="hover:text-[#a855f7]">
              Tech Stack
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
          <div>GitVerse Repository Hosting & Custom CLI Client</div>
          <div>
            GitVerse Repository Hosting • Sharpie Neobrutalism Design Token
          </div>
        </div>
      </footer>
    </div>
  );
}
