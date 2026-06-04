"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Exams",    href: "/exams"    },
  { label: "Features", href: "/#features" },
  { label: "Pricing",  href: "/pricing"  },
  { label: "About",    href: "/about"    },
] as const;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border-cyan)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(3, 5, 15, 0.85)",
      }}
    >
      <div
        className="section-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="font-heading" style={{ fontSize: "1.25rem", fontWeight: 800 }}>
            <span style={{ color: "var(--text-primary)" }}>Prep</span>
            <span style={{ color: "var(--accent-cyan)" }}>AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex" style={{ gap: "2rem" }}>
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="nav-link"
              style={{ fontSize: "0.875rem", textDecoration: "none" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex" style={{ gap: "0.75rem", alignItems: "center" }}>
          <Link
            href="/login"
            style={{
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              transition: "border-color 0.2s",
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
          <Link
            href="/register"
            style={{
              color: "var(--accent-cyan)",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "0.5rem 1.25rem",
              borderRadius: 8,
              border: "1px solid var(--accent-cyan)",
              textDecoration: "none",
              transition: "background-color 0.2s",
            }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
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
          {([0, 1, 2] as const).map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: 22,
                height: 2,
                borderRadius: 2,
                backgroundColor: "var(--text-primary)",
                transition: "transform 0.2s ease, opacity 0.2s ease",
                ...(mobileOpen && i === 0 ? { transform: "translateY(7px) rotate(45deg)" } : {}),
                ...(mobileOpen && i === 1 ? { opacity: 0 } : {}),
                ...(mobileOpen && i === 2 ? { transform: "translateY(-7px) rotate(-45deg)" } : {}),
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid rgba(0,229,255,0.08)",
              backgroundColor: "var(--bg-surface)",
            }}
          >
            <div
              className="section-container"
              style={{
                padding: "1.25rem 2rem 1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                  onClick={() => setMobileOpen(false)}
                  style={{ fontSize: "1rem", textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              ))}
              <div
                style={{
                  paddingTop: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <Link
                  href="/login"
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    padding: "0.65rem 1rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  style={{
                    color: "var(--accent-cyan)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    padding: "0.65rem 1rem",
                    borderRadius: 8,
                    border: "1px solid var(--accent-cyan)",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
