"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { signOut } from "@/lib/auth/actions";

interface DashboardNavProps {
  userName?: string;
  avatarUrl?: string;
}

const CENTER_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Exams",  href: "/exams"     },
] as const;

export default function DashboardNav({
  userName: propUserName = "User",
  avatarUrl: propAvatarUrl,
}: DashboardNavProps) {
  const { profile } = useUser();
  const userName = profile?.full_name || propUserName;
  const avatarUrl = profile?.avatar_url ?? propAvatarUrl;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initial = userName.charAt(0).toUpperCase();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
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

        {/* Center nav links */}
        <nav className="hidden md:flex" style={{ gap: "2rem" }}>
          {CENTER_LINKS.map((item) => (
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

        {/* Right: bell + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Notification bell */}
          <button
            aria-label="Notifications"
            style={{
              background: "none",
              border: "1px solid var(--border-cyan)",
              borderRadius: 8,
              padding: "0.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              transition: "color 0.2s, border-color 0.2s",
            }}
          >
            <Bell size={17} />
          </button>

          {/* User avatar dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              aria-label="User menu"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "none",
                border: "1px solid var(--border-cyan)",
                borderRadius: 8,
                padding: "0.35rem 0.65rem 0.35rem 0.4rem",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: avatarUrl ? undefined : "var(--gradient-accent)",
                  backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!avatarUrl && (
                  <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>
                    {initial}
                  </span>
                )}
              </div>
              <span
                className="hidden md:block"
                style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 500 }}
              >
                {userName}
              </span>
              <ChevronDown
                size={13}
                style={{
                  color: "var(--text-muted)",
                  transition: "transform 0.2s",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  key="user-dropdown"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    minWidth: 176,
                    backgroundColor: "var(--bg-surface-2)",
                    border: "1px solid var(--border-cyan)",
                    borderRadius: 10,
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  {[
                    { label: "Profile",  Icon: User,     href: "/account" },
                    { label: "Settings", Icon: Settings, href: "/account" },
                  ].map(({ label, Icon, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.65rem 1rem",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        transition: "background-color 0.15s, color 0.15s",
                      }}
                    >
                      <Icon size={14} />
                      {label}
                    </Link>
                  ))}

                  <div style={{ borderTop: "1px solid var(--border-cyan)", margin: "0.2rem 0" }} />

                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await signOut();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.65rem 1rem",
                      color: "#ef4444",
                      fontSize: "0.85rem",
                      width: "100%",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background-color 0.15s",
                    }}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
