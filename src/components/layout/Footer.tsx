import Link from "next/link";
import { X } from "lucide-react";

const LINKS = {
  Platform: [
    { label: "Exams",    href: "/exams" },
    { label: "Features", href: "/#features" },
    { label: "Pricing",  href: "/pricing" },
  ],
  Company: [
    { label: "About",   href: "/about" },
    { label: "Blog",    href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Terms",   href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
} as const;

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-cyan)",
        backgroundColor: "var(--bg-surface)",
        padding: "3rem 0 1.75rem",
      }}
    >
      <div className="section-container">
        {/* Top grid: logo + link columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "2.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand column */}
          <div>
            <span
              className="font-heading"
              style={{ fontSize: "1.2rem", fontWeight: 800 }}
            >
              <span style={{ color: "var(--text-primary)" }}>Prep</span>
              <span style={{ color: "var(--accent-cyan)" }}>AI</span>
            </span>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                lineHeight: 1.65,
                marginTop: "0.75rem",
                maxWidth: 200,
              }}
            >
              AI-powered exam prep for Nigerian professionals.
            </p>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [string, readonly { label: string; href: string }[]][]).map(
            ([heading, links]) => (
              <div key={heading}>
                <p
                  className="font-heading"
                  style={{
                    color: "var(--text-primary)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "0.875rem",
                  }}
                >
                  {heading}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}
                >
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="nav-link"
                      style={{ fontSize: "0.875rem", textDecoration: "none" }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--border-cyan)",
            paddingTop: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} PrepAI. Built for Nigerian professionals.
          </p>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* X (Twitter) */}
            <a
              href="https://twitter.com/prepai"
              aria-label="X / Twitter"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
            >
              <X size={17} />
            </a>
            {/* LinkedIn (inline SVG — not in this lucide-react version) */}
            <a
              href="https://linkedin.com/company/prepai"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
