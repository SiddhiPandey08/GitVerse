import { useState, useEffect, useRef } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   Testimonials Section
   ========================================================= */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Our standup went from Zoom lag to zero friction. Meridian just works.",
      name: "Sarah Jenkins",
      role: "Engineering Lead, Notion clone team",
    },
    {
      quote: "No signup for guests means our clients actually show up on time.",
      name: "Rahul Mehta",
      role: "Freelance Consultant",
    },
    {
      quote: "Peer-to-peer and it shows — calls feel instant, not laggy.",
      name: "Amara Okafor",
      role: "Product Designer",
    },
  ];

  return (
    <section className="testimonialsSection">
      <h2>Teams are talking</h2>
      <div className="testimonialsGrid">
        {testimonials.map((t, i) => (
          <div className="testimonialCard" key={i}>
            <svg
              className="quoteMark"
              viewBox="0 0 24 24"
              width="28"
              height="28"
            >
              <path
                d="M7 11c-1.5 0-2.5 1-2.5 2.5S5.5 16 7 16c.3 0 .5 0 .8-.1-.3 1.4-1.4 2.6-2.8 3v1.5c2.6-.4 4.5-2.6 4.5-5.4V13c0-1.5-1-2-2.5-2zm10 0c-1.5 0-2.5 1-2.5 2.5s1 2.5 2.5 2.5c.3 0 .5 0 .8-.1-.3 1.4-1.4 2.6-2.8 3v1.5c2.6-.4 4.5-2.6 4.5-5.4V13c0-1.5-1-2-2.5-2z"
                fill="var(--mustard)"
              />
            </svg>
            <p className="testimonialQuote">{t.quote}</p>
            <div className="testimonialAuthor">
              <div className="testimonialAvatar">{t.name.charAt(0)}</div>
              <div>
                <p className="testimonialName">{t.name}</p>
                <p className="testimonialRole">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   FAQ Accordion Section
   ========================================================= */
function FAQItem({ question, answer, isOpen, onToggle }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      height: isOpen ? "auto" : 0,
      duration: 0.35,
      ease: "power2.inOut",
    });
  }, [isOpen]);

  return (
    <div className={`faqItem ${isOpen ? "faqItemOpen" : ""}`}>
      <button className="faqQuestion" onClick={onToggle} type="button">
        <span>{question}</span>
        <span className="faqIcon">{isOpen ? "−" : "+"}</span>
      </button>
      <div className="faqAnswerWrapper" ref={contentRef}>
        <p className="faqAnswer">{answer}</p>
      </div>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Do I need an account to join a meeting?",
      a: "No — guests can join instantly with just a name and a meeting code. No signup required.",
    },
    {
      q: "Is it really peer-to-peer?",
      a: "Yes. Video and audio connect directly between participants using WebRTC, keeping calls fast and private.",
    },
    {
      q: "Is there a participant limit?",
      a: "Meridian is built for small, focused calls — ideal for teams and 1:1s rather than large webinars.",
    },
    {
      q: "Do I need to install anything?",
      a: "Nothing to install. Meridian runs entirely in your browser.",
    },
  ];

  return (
    <section className="faqSection">
      <h2>Questions, answered</h2>
      <div className="faqList">
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            question={faq.q}
            answer={faq.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   Footer
   ========================================================= */
function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="footerTop">
        <img src="/meridianLogo.png" alt="Meridian" className="footerLogo" />
        <div className="footerLinks">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <Link to="/auth" state={{ formState: 1 }}>
            Get Started
          </Link>
        </div>
      </div>
      <div className="footerBottom">
        <p>
          © {new Date().getFullYear()} Meridian. Built for real conversations.
        </p>
      </div>
    </footer>
  );
}
/* =========================================================
   2. Rotating Brand Badge
   ========================================================= */
function SpinningMark({ size = 360 }) {
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.to(ringRef.current, {
      rotation: 360,
      duration: 18,
      repeat: -1,
      ease: "linear",
      svgOrigin: "150 150",
    });

    return () => tween.kill();
  }, []);

  const repeated = "MERIDIAN • CONNECT • COLLABORATE • CREATE • MERIDIAN • ";
  return (
    <div className="spinningMark">
      <svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <defs>
          <path
            id="meridianCircle"
            d="
    M150,150
    m-110,0
    a110,110 0 1,1 220,0
    a110,110 0 1,1 -220,0
  "
          />
        </defs>

        <g ref={ringRef}>
          <text
            fill="var(--rust)"
            fontSize="17"
            fontWeight="700"
            letterSpacing="3"
            fontFamily="var(--font-body)"
            dominantBaseline="middle"
            textAnchor="middle"
          >
            <textPath
              href="#meridianCircle"
              startOffset="50%"
              textAnchor="middle"
            >
              {repeated}
            </textPath>
          </text>
        </g>

        <circle cx="150" cy="150" r="50" fill="var(--mustard)" />

        <g
          transform="translate(150 150)"
          stroke="var(--navy-dark)"
          strokeWidth="4.5"
          fill="none"
        >
          <circle r="24" />
          <path d="M0 -24V24" />
          <path d="M-24 0H24" />
          <ellipse rx="10" ry="24" />
          <ellipse rx="18" ry="24" />
          <ellipse rx="22" ry="6" cy="-8" />
          <ellipse rx="22" ry="6" cy="8" />
        </g>
      </svg>
    </div>
  );
}

/* =========================================================
   3. Redesigned Guest Join Modal Form
   ========================================================= */
function GuestJoinForm({ open, onClose }) {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;
    document.body.classList.add("modalOpen");
    inputRef.current?.focus();

    // Smooth entry animation
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" },
    );
    gsap.fromTo(
      cardRef.current,
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.4)" },
    );

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modalOpen");
      triggerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleJoin = (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    navigate(`/${code.trim()}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setCode(text.trim());
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="guestJoinModalOverlay"
      ref={overlayRef}
      onClick={onClose}
    >
      <div
        className="guestJoinModalCard"
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-join-title"
        aria-describedby="guest-join-description"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="guestJoinCloseBtn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="guestJoinHeader">
          <div className="guestJoinIconBadge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="guestJoinEyebrow">No account needed</p>
          <h2 id="guest-join-title">Join a Meridian call</h2>
          <p id="guest-join-description">
            Enter the meeting code shared by your host to join instantly.
          </p>
        </div>

        <form onSubmit={handleJoin} className="guestJoinFormBody">
          <div className="guestInputWrapper">
            <label htmlFor="guest-meeting-code">Meeting code</label>
            <input
              ref={inputRef}
              id="guest-meeting-code"
              type="text"
              placeholder="e.g. meridian-123"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s+/g, " "))}
              className="guestCodeInput"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="pasteBadgeBtn"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              Paste
            </button>
          </div>

          <div className="guestJoinActions">
            <button
              type="submit"
              className="guestSubmitBtn"
              disabled={!code.trim()}
            >
              Join call
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
        <p className="guestJoinNote">
          <span aria-hidden="true">✦</span> Your browser will ask for camera and
          microphone access once you join.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   4. Landing Page
   ========================================================= */
function LandingPage() {
  const [guestOpen, setGuestOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Animated entrance for features and steps
      gsap.utils.toArray(".stepCard, .featureCard").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: (i % 3) * 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
              invalidateOnRefresh: true,
            },
          },
        );
      });
    });

    const handleRefresh = () => ScrollTrigger.refresh();
    document.fonts?.ready?.then(handleRefresh);
    window.addEventListener("load", handleRefresh);

    return () => {
      window.removeEventListener("load", handleRefresh);
      ctx.revert();
    };
  }, []);

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <img src="/meridianLogo.png" alt="Meridian" className="logo" />
        </div>
        <div className="navList">
          <button
            type="button"
            className="navTextBtn"
            onClick={() => setGuestOpen(true)}
          >
            Join as Guest
          </button>
          <Link
            to="/auth"
            state={{ formState: 1 }}
            style={{ textDecoration: "none" }}
          >
            <p className="navLinkText">Register</p>
          </Link>
          <div role="button" className="navPrimaryBtn">
            <Link
              to="/auth"
              state={{ formState: 0 }}
              style={{ textDecoration: "none" }}
            >
              <p>Login</p>
            </Link>
          </div>
        </div>
      </nav>

      <GuestJoinForm open={guestOpen} onClose={() => setGuestOpen(false)} />

      <div className="landingMainContainer">
        <div>
          <h1>
            <span className="accent">Close the distance</span>, in real time
          </h1>
          <p className="tagline">
            A secure, elegant platform for meetings, collaboration, and
            conversations that matter.
          </p>
          <div role="button" className="heroCtaBtn">
            <Link
              to="/auth"
              state={{ formState: 1 }}
              style={{ textDecoration: "none" }}
            >
              <p style={{ margin: 0 }}>Get Started</p>
            </Link>
          </div>
        </div>
        <SpinningMark size={400} />
      </div>

      <section className="howItWorks">
        <h2>Three steps, no friction</h2>
        <div className="stepsGrid">
          <div className="stepCard">
            <svg className="stepMark" viewBox="0 0 24 24">
              <path
                d="M12 2 L14 10.5 L22 12 L14 13.5 L12 22 L10 13.5 L2 12 L10 10.5 Z"
                fill="currentColor"
              />
            </svg>
            <h3>Create a room</h3>
            <p>Start a meeting in one click, no setup required.</p>
          </div>
          <div className="stepCard">
            <svg className="stepMark" viewBox="0 0 24 24">
              <path
                d="M12 2 L14 10.5 L22 12 L14 13.5 L12 22 L10 13.5 L2 12 L10 10.5 Z"
                fill="currentColor"
              />
            </svg>
            <h3>Share the link</h3>
            <p>Send the meeting code to anyone, anywhere.</p>
          </div>
          <div className="stepCard">
            <svg className="stepMark" viewBox="0 0 24 24">
              <path
                d="M12 2 L14 10.5 L22 12 L14 13.5 L12 22 L10 13.5 L2 12 L10 10.5 Z"
                fill="currentColor"
              />
            </svg>
            <h3>Talk face to face</h3>
            <p>Clear peer-to-peer video, straight from the browser.</p>
          </div>
        </div>
      </section>

      <section className="featuresSection">
        <img
          src="/meridianLogo.png"
          alt=""
          className="watermark"
          aria-hidden="true"
        />
        <div className="featuresGrid">
          <div className="featureCard">
            <h3>Peer-to-peer video</h3>
            <p>Direct connections keep calls fast and private.</p>
          </div>
          <div className="featureCard">
            <h3>No signup for guests</h3>
            <p>Join with just a name and a meeting code.</p>
          </div>
          <div className="featureCard">
            <h3>Meeting history</h3>
            <p>Every call you've joined, saved to your account.</p>
          </div>
        </div>
      </section>

      <section className="closingCta">
        <h2>Ready to close the distance?</h2>
        <div role="button" className="heroCtaBtn">
          <Link to="/auth" state={{ formState: 1 }}>
            Get Started
          </Link>
        </div>
      </section>
      <TestimonialsSection />
      <FAQSection />
      <SiteFooter />
    </div>
  );
}

export default LandingPage;
