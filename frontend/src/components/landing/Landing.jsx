import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./landing.css";
import heroCoder from "../../assets/illustrations/hero-coder.svg";
import ctaDev from "../../assets/illustrations/cta-dev.svg";
import stepsKeyboard from "../../assets/illustrations/steps-keyboard.svg";

// Change these to match the paths in Routes.jsx
const ROUTES = { login: "/login", signup: "/signup" };

const TERMINAL = [
  { p: true, t: "gitv init 6aad6ffcd049" },
  { p: true, t: "gitv login" },
  { t: "Logged in as sera" },
  { p: true, t: "gitv add README.md" },
  { p: true, t: 'gitv commit "Add README"' },
  { p: true, t: "gitv push" },
  { t: "Pushed 1 commit (fcb2b6c)" },
];

const COMMITS = [
  { msg: "Add README", hash: "fcb2b6c", c: "#ff7ab8" },
  { msg: "Add b.txt", hash: "adb5da9", c: "#3ddc97" },
  { msg: "Update hello.txt", hash: "7c41e02", c: "#6b77ff" },
  { msg: "First commit", hash: "0e93a1b", c: "#a78bfa" },
];

const STEPS = [
  { title: "Link", body: <>Create a repository on the site, then run <code>gitv init</code> with its ID inside your folder.</> },
  { title: "Log in", body: <>Run <code>gitv login</code> and enter the email and password from your account.</> },
  { title: "Push", body: <>Add, commit, and run <code>gitv push</code>. Refresh the repository page to see it.</> },
];

const MARQUEE = "commits \u00a0 READMEs \u00a0 one login \u00a0 push \u00a0 pull \u00a0 open source \u00a0 ";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// True once the element has scrolled into view (immediately true with reduced motion)
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (prefersReduced()) {
      setSeen(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

const Bar = () => (
  <div className="gv-bar">
    <i />
    <i />
    <i />
  </div>
);

function Reveal({ className = "", delay = 0, children }) {
  const [ref, seen] = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`gv-pop ${seen ? "in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

function PushDemo() {
  const [ref, seen] = useInView(0.5);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!seen) return;
    if (prefersReduced()) {
      setShown(TERMINAL.length + 1);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i > TERMINAL.length) clearInterval(id);
    }, 550);
    return () => clearInterval(id);
  }, [seen]);

  return (
    <div ref={ref}>
      <div className="gv-win">
        <Bar />
        <div className="gv-term">
          {TERMINAL.map((l, i) => (
            <div key={i} className={`gv-ln ${shown > i ? "on" : ""}`}>
              {l.p ? <b>$</b> : null} {l.p ? l.t : <em>{l.t}</em>}
            </div>
          ))}
        </div>
      </div>
      <div className={`gv-win gv-land ${shown > TERMINAL.length ? "on" : ""}`}>
        <div className="gv-bd">
          <div className="gv-cm">
            <span><b>Add README</b> &nbsp;just now</span>
            <code>fcb2b6c</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function Timeline() {
  const [ref, seen] = useInView(0.3);
  return (
    <div ref={ref} className={`gv-tl ${seen ? "in" : ""}`}>
      {COMMITS.map((c) => (
        <div key={c.hash} className="gv-cmt" style={{ "--c": c.c }}>
          <b>{c.msg}</b>
          <code>{c.hash}</code>
        </div>
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="gv">
      <nav className="gv-nav">
        <div className="gv-w">
          <a className="gv-logo" href="#top">GitVerse</a>
          <div className="gv-nav-r">
            <a className="gv-hide" href="#how">How it works</a>
            <Link className="gv-btn gv-btn-alt" to={ROUTES.login}>Log in</Link>
            <Link className="gv-btn" to={ROUTES.signup}>Sign up</Link>
          </div>
        </div>
      </nav>

      <section id="top" className="gv-sec gv-hero">
        <div className="gv-w gv-grid">
          <div>
            <h1 className="gv-up">Your code, on the web and in your terminal.</h1>
            <p className="gv-lead gv-up" style={{ animationDelay: ".12s" }}>
              GitVerse is a place to keep your repositories. Push from the command line,
              then browse files, commits and READMEs in the browser.
            </p>
            <div className="gv-row gv-up" style={{ animationDelay: ".24s" }}>
              <Link className="gv-btn" to={ROUTES.signup}>Create an account</Link>
              <a className="gv-btn gv-btn-alt" href="#how">See how it works</a>
            </div>
          </div>
          <div className="gv-stk gv-up" style={{ animationDelay: ".2s" }}>
            <img className="gv-ill" src={heroCoder} alt="" />
            <div className="gv-win">
              <Bar />
              <div className="gv-bd">
                <div className="gv-rp">sera / test-repo</div>
                <div className="gv-f"><span>b.txt</span><span>4 KB</span></div>
                <div className="gv-f"><span>hello.txt</span><span>1 KB</span></div>
                <div className="gv-f"><span>README.md</span><span>2 KB</span></div>
                <div className="gv-cm">
                  <span><b>Add README</b> &nbsp;3 files</span>
                  <code>fcb2b6c</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gv-mq" aria-hidden="true">
        <div>{Array.from({ length: 4 }, (_, i) => <span key={i}>{MARQUEE}</span>)}</div>
      </div>

      <section className="gv-sec gv-color gv-blue">
        <div className="gv-w gv-split">
          <div>
            <h2>Push from the terminal. It shows up in the browser.</h2>
            <p>Link a folder to a repository, log in once, and push your commits. They appear on your repository page right away.</p>
          </div>
          <PushDemo />
        </div>
      </section>

      <section className="gv-sec">
        <div className="gv-w gv-split gv-flip">
          <div>
            <h2>Every commit, in order.</h2>
            <p>Scroll your history from newest to oldest. Each commit shows its message, its author and the files it contains.</p>
          </div>
          <Timeline />
        </div>
      </section>

      <section className="gv-sec gv-color gv-mint">
        <div className="gv-w gv-split">
          <div>
            <h2>Your README, rendered.</h2>
            <p>Bold text, links, task lists, tables and code blocks all display properly. Open a repository and read it like a project page.</p>
          </div>
          <Reveal className="gv-win">
            <Bar />
            <div className="gv-bd">
              <div className="gv-mdh">GitVerse Test Repo</div>
              <p className="gv-mdp">A <b>first</b> README with a <a href="#top">link</a>.</p>
              <div className="gv-f"><span>&#9745; Login from the CLI</span></div>
              <div className="gv-f"><span>&#9744; Folders</span></div>
              <div className="gv-f"><span><b>push</b></span><span>Uploads commits</span></div>
              <div className="gv-f"><span><b>pull</b></span><span>Downloads commits</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="gv-sec gv-color gv-violet">
        <div className="gv-w gv-split gv-flip">
          <div>
            <h2>One account for both.</h2>
            <p>The site and the command line use the same login. Sign in on the web, then sign in from your terminal, and your repositories are already there.</p>
          </div>
          <Reveal className="gv-win">
            <Bar />
            <div className="gv-bd">
              <div className="gv-link">
                <div className="gv-node">Browser</div>
                <div className="gv-wire"><b /></div>
                <div className="gv-node">Command line</div>
              </div>
              <div className="gv-f gv-mt"><span>Signed in as sera</span><span>Same repositories</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="how" className="gv-sec">
        <div className="gv-w">
          <div className="gv-hh">
            <h2>Three commands to your first push.</h2>
            <img className="gv-ill" src={stepsKeyboard} alt="" />
          </div>
          <div className="gv-steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} className="gv-st" delay={i * 0.12}>
                <span className="gv-n">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="gv-sec gv-color gv-pink gv-cta">
        <div className="gv-w">
          <img className="gv-ill gv-ill-cta" src={ctaDev} alt="" />
          <h2>Make your first repository.</h2>
          <Link className="gv-btn" to={ROUTES.signup}>Sign up free</Link>
        </div>
      </section>

      <footer className="gv-foot">
        <div className="gv-w">
          <span>GitVerse, a portfolio project by Sera</span>
          <span>Illustrations by <a href="https://storyset.com">Storyset</a></span>
          <a href="https://github.com/">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
