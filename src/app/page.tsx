"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const LIVE_EXAMS = [
  { name: "ICAN", field: "Accounting", icon: "📊" },
  { name: "Bar Finals", field: "Law", icon: "⚖️" },
  { name: "MDCN", field: "Medicine", icon: "🩺" },
  { name: "COREN", field: "Engineering", icon: "⚙️" },
  { name: "ARCON", field: "Architecture", icon: "🏛️" },
  { name: "NMCN", field: "Nursing", icon: "🏥" },
];

const COMING_SOON_EXAMS = [
  { name: "CIBN", field: "Banking", icon: "🏦" },
  { name: "CIPM", field: "HR", icon: "👥" },
];

const STATS = [
  { value: "10+", label: "Exams Covered" },
  { value: "50k+", label: "Past Questions" },
  { value: "94%", label: "Pass Rate" },
  { value: "24/7", label: "AI Available" },
];

const FEATURES = [
  {
    icon: "🃏",
    title: "Smart Flashcards",
    desc: "AI generates exam-relevant flashcards tuned to your weak spots, so every review session counts.",
  },
  {
    icon: "⏱️",
    title: "Timed Mock Exams",
    desc: "Simulate the real exam environment with authentic question sets, time pressure, and instant scoring.",
  },
  {
    icon: "💡",
    title: "Instant Explanations",
    desc: "Got a question wrong? Your AI tutor explains the concept, not just the answer.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    desc: "See your weak topics, test history, and study streaks in a single dashboard.",
  },
];

// ─── Scroll-triggered section wrapper ────────────────────────────────────────

function ScrollSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Exam card ────────────────────────────────────────────────────────────────

function ExamCard({
  name,
  field,
  icon,
  comingSoon = false,
}: {
  name: string;
  field: string;
  icon: string;
  comingSoon?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#080d1e",
        border: `1px solid ${hovered && !comingSoon ? "rgba(0,229,255,0.35)" : "rgba(0,229,255,0.12)"}`,
        borderRadius: 12,
        padding: "1.5rem",
        position: "relative",
        opacity: comingSoon ? 0.6 : 1,
        transform: hovered && !comingSoon ? "translateY(-2px)" : "translateY(0)",
        transition: "border-color 0.2s ease, transform 0.2s ease",
        cursor: comingSoon ? "default" : "pointer",
        overflow: "hidden",
      }}
    >
      {/* Hover gradient overlay */}
      {hovered && !comingSoon && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(123,47,255,0.04) 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Coming soon badge */}
      {comingSoon && (
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            backgroundColor: "rgba(123,47,255,0.12)",
            border: "1px solid rgba(123,47,255,0.35)",
            color: "#b57bff",
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "0.2rem 0.6rem",
            borderRadius: 999,
          }}
        >
          Soon
        </div>
      )}

      {/* Icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: "rgba(0,229,255,0.08)",
          border: "1px solid rgba(0,229,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          marginBottom: "0.75rem",
        }}
      >
        {icon}
      </div>

      <p
        className="font-heading"
        style={{ color: "#e8eaf6", fontWeight: 600, marginBottom: "0.25rem" }}
      >
        {name}
      </p>
      <p
        style={{
          color: "#00e5ff",
          fontSize: "0.75rem",
          opacity: 0.75,
          letterSpacing: "0.04em",
        }}
      >
        {field}
      </p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "#03050f",
        color: "#e8eaf6",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── Background effects ─────────────────────────────────────────── */}
      <div aria-hidden="true" className="grid-bg" />
      <div aria-hidden="true" className="glow-orb" />
      <div aria-hidden="true" className="glow-orb-2" />

      {/* ── All content sits above the background ──────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ════════════════════════════════════════════════════════════════
            NAVBAR
        ════════════════════════════════════════════════════════════════ */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(0,229,255,0.12)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            backgroundColor: "rgba(3,5,15,0.82)",
          }}
        >
          <div
            className="section-container"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}
          >
            {/* Logo */}
            <span className="font-heading" style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              <span style={{ color: "#e8eaf6" }}>Prep</span>
              <span style={{ color: "#00e5ff" }}>AI</span>
            </span>

            {/* Desktop nav */}
            <nav className="hidden md:flex" style={{ gap: "2rem" }}>
              {["Exams", "Features", "Pricing", "About"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="nav-link"
                  style={{ fontSize: "0.875rem" }}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex" style={{ gap: "0.75rem", alignItems: "center" }}>
              <a
                href="#"
                style={{
                  color: "#e8eaf6",
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  borderRadius: 8,
                  border: "1px solid rgba(232,234,246,0.15)",
                  transition: "border-color 0.2s",
                  textDecoration: "none",
                }}
              >
                Log in
              </a>
              <a
                href="#"
                style={{
                  background: "linear-gradient(135deg, #00e5ff, #7b2fff)",
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  padding: "0.5rem 1.25rem",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
              >
                Get Started
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    width: 22,
                    height: 2,
                    borderRadius: 2,
                    backgroundColor: "#e8eaf6",
                    transition: "transform 0.2s, opacity 0.2s",
                    ...(mobileOpen && i === 0
                      ? { transform: "translateY(7px) rotate(45deg)" }
                      : mobileOpen && i === 1
                      ? { opacity: 0 }
                      : mobileOpen && i === 2
                      ? { transform: "translateY(-7px) rotate(-45deg)" }
                      : {}),
                  }}
                />
              ))}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  overflow: "hidden",
                  borderTop: "1px solid rgba(0,229,255,0.08)",
                  backgroundColor: "#080d1e",
                }}
              >
                <div
                  className="section-container"
                  style={{ padding: "1rem 2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
                >
                  {["Exams", "Features", "Pricing", "About"].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="nav-link"
                      onClick={() => setMobileOpen(false)}
                      style={{ fontSize: "1rem" }}
                    >
                      {item}
                    </a>
                  ))}
                  <div style={{ paddingTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#e8eaf6",
                        fontSize: "0.9rem",
                        padding: "0.6rem 1rem",
                        borderRadius: 8,
                        border: "1px solid rgba(232,234,246,0.15)",
                        textAlign: "center",
                        textDecoration: "none",
                      }}
                    >
                      Log in
                    </a>
                    <a
                      href="#"
                      style={{
                        background: "linear-gradient(135deg, #00e5ff, #7b2fff)",
                        color: "#fff",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        padding: "0.6rem 1rem",
                        borderRadius: 8,
                        textAlign: "center",
                        textDecoration: "none",
                      }}
                    >
                      Get Started
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ════════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════════ */}
        <section
          style={{
            padding: "7rem 0 5rem",
            textAlign: "center",
          }}
        >
          <div className="section-container">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.75rem" }}
            >
              {/* Badge */}
              <motion.div variants={fadeUp}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(0,229,255,0.06)",
                    border: "1px solid rgba(0,229,255,0.18)",
                    color: "#00e5ff",
                    padding: "0.35rem 1rem",
                    borderRadius: 999,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {/* Pulsing dot */}
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#00e5ff",
                      flexShrink: 0,
                    }}
                  />
                  {"Nigeria's Professional Exam Platform"}
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={fadeUp}
                className="font-heading"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  maxWidth: 820,
                  color: "#e8eaf6",
                }}
              >
                Pass your{" "}
                <span className="gradient-text">professional exam</span>
                {" "}the smart way
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                style={{
                  color: "#6b7280",
                  fontSize: "1.125rem",
                  lineHeight: 1.7,
                  maxWidth: 520,
                  margin: "0 auto",
                }}
              >
                PrepAI combines AI-generated flashcards, timed mock tests, and instant explanations to get you exam-ready — faster.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={fadeUp}
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}
              >
                <a
                  href="#exams"
                  style={{
                    background: "linear-gradient(135deg, #00e5ff, #7b2fff)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    padding: "0.875rem 2rem",
                    borderRadius: 10,
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "opacity 0.2s",
                  }}
                >
                  Start Studying Free
                </a>
                <a
                  href="#features"
                  style={{
                    background: "transparent",
                    color: "#e8eaf6",
                    fontWeight: 500,
                    fontSize: "1rem",
                    padding: "0.875rem 2rem",
                    borderRadius: 10,
                    border: "1px solid rgba(232,234,246,0.2)",
                    textDecoration: "none",
                    display: "inline-block",
                    transition: "border-color 0.2s",
                  }}
                >
                  See How It Works
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            STATS BAR
        ════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderTop: "1px solid rgba(0,229,255,0.12)",
            borderBottom: "1px solid rgba(0,229,255,0.12)",
          }}
        >
          <div className="section-container">
            <ScrollSection>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  padding: "2.5rem 0",
                  gap: "2rem",
                }}
              >
                {STATS.map((stat) => (
                  <motion.div
                    key={stat.value}
                    variants={fadeUp}
                    style={{ textAlign: "center" }}
                  >
                    <p
                      className="font-heading"
                      style={{
                        color: "#00e5ff",
                        fontSize: "2rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        marginBottom: "0.4rem",
                      }}
                    >
                      {stat.value}
                    </p>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollSection>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            EXAMS GRID
        ════════════════════════════════════════════════════════════════ */}
        <section id="exams" style={{ padding: "6rem 0" }}>
          <div className="section-container">
            <ScrollSection>
              {/* Section header */}
              <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "3rem" }}>
                <p
                  style={{
                    color: "#00e5ff",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  Supported Exams
                </p>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#e8eaf6",
                    marginBottom: "0.75rem",
                  }}
                >
                  Pick your exam, start today
                </h2>
                <p style={{ color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>
                  AI-powered prep for every major Nigerian professional licensing exam, with more on the way.
                </p>
              </motion.div>

              {/* Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {LIVE_EXAMS.map((exam) => (
                  <ExamCard key={exam.name} {...exam} />
                ))}
                {COMING_SOON_EXAMS.map((exam) => (
                  <ExamCard key={exam.name} {...exam} comingSoon />
                ))}
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FEATURES
        ════════════════════════════════════════════════════════════════ */}
        <section
          id="features"
          style={{
            borderTop: "1px solid rgba(0,229,255,0.12)",
            borderBottom: "1px solid rgba(0,229,255,0.12)",
            backgroundColor: "#080d1e",
            padding: "6rem 0",
          }}
        >
          <div className="section-container">
            <ScrollSection>
              {/* Section header */}
              <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "3rem" }}>
                <p
                  style={{
                    color: "#00e5ff",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  Why PrepAI
                </p>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#e8eaf6",
                  }}
                >
                  Everything you need to pass
                </h2>
              </motion.div>

              {/* Feature cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1.25rem",
                }}
              >
                {FEATURES.map((feat) => (
                  <motion.div
                    key={feat.title}
                    variants={fadeUp}
                    style={{
                      backgroundColor: "#03050f",
                      border: "1px solid rgba(0,229,255,0.12)",
                      borderRadius: 16,
                      padding: "2rem 1.75rem",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{feat.icon}</div>
                    <h3
                      className="font-heading"
                      style={{
                        color: "#e8eaf6",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        marginBottom: "0.6rem",
                      }}
                    >
                      {feat.title}
                    </h3>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.65 }}>
                      {feat.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            HOW IT WORKS  (3-step)
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ padding: "6rem 0" }}>
          <div className="section-container">
            <ScrollSection>
              <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <p
                  style={{
                    color: "#00e5ff",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  Getting Started
                </p>
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#e8eaf6",
                  }}
                >
                  Up and running in minutes
                </h2>
              </motion.div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "2rem",
                  position: "relative",
                }}
              >
                {[
                  {
                    step: "01",
                    title: "Choose your exam",
                    desc: "Select from our growing library of Nigerian professional licensing exams.",
                  },
                  {
                    step: "02",
                    title: "Let AI build your plan",
                    desc: "PrepAI analyses past questions and your target date to create a personalised study schedule.",
                  },
                  {
                    step: "03",
                    title: "Study, test, pass",
                    desc: "Work through flashcards and mock tests daily. Track your progress until you're ready.",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.step}
                    variants={fadeUp}
                    style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        border: "1px solid rgba(0,229,255,0.3)",
                        backgroundColor: "rgba(0,229,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#00e5ff",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                      }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h3
                        className="font-heading"
                        style={{
                          color: "#e8eaf6",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {item.title}
                      </h3>
                      <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.65 }}>
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            CTA SECTION
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ padding: "4rem 0 7rem" }}>
          <div className="section-container">
            <ScrollSection>
              <motion.div
                variants={fadeUp}
                style={{
                  maxWidth: 600,
                  margin: "0 auto",
                  backgroundColor: "#0d1530",
                  border: "1px solid rgba(0,229,255,0.15)",
                  borderRadius: 20,
                  padding: "3.5rem 2.5rem",
                  textAlign: "center",
                }}
              >
                <h2
                  className="font-heading"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#e8eaf6",
                    marginBottom: "1rem",
                  }}
                >
                  Ready to start passing?
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    marginBottom: "2rem",
                  }}
                >
                  Join thousands of Nigerian professionals who use PrepAI to study smarter and pass on the first attempt.
                </p>
                <a
                  href="#"
                  style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg, #00e5ff, #7b2fff)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "1rem",
                    padding: "0.875rem 2.5rem",
                    borderRadius: 10,
                    textDecoration: "none",
                    transition: "opacity 0.2s",
                  }}
                >
                  Create Free Account
                </a>
              </motion.div>
            </ScrollSection>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════════ */}
        <footer
          style={{
            borderTop: "1px solid rgba(0,229,255,0.12)",
            padding: "1.75rem 0",
          }}
        >
          <div
            className="section-container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <span className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
              <span style={{ color: "#e8eaf6" }}>Prep</span>
              <span style={{ color: "#00e5ff" }}>AI</span>
            </span>
            <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>
              © {new Date().getFullYear()} PrepAI. Built for Nigerian professionals.
            </p>
          </div>
        </footer>

      </div>{/* /relative wrapper */}
    </div>
  );
}
