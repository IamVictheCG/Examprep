"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  BarChart2,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DashboardSidebarProps {
  examId?: string;
  activePage?: string;
}

const NAV_ITEMS = [
  { label: "Overview",      icon: LayoutDashboard, href: "/dashboard"           },
  { label: "Flashcards",    icon: BookOpen,        href: "/dashboard/flashcards" },
  { label: "Mock Test",     icon: ClipboardList,   href: "/dashboard/mock-test"  },
  { label: "Question Bank", icon: HelpCircle,      href: "/dashboard/questions"  },
  { label: "Analytics",     icon: BarChart2,       href: "/dashboard/analytics"  },
  { label: "AI Tutor",      icon: BrainCircuit,    href: "/dashboard/tutor"      },
] as const;

export default function DashboardSidebar({ examId, activePage }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      style={{
        flexShrink: 0,
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-cyan)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Nav items */}
      <nav style={{ flex: 1, paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const resolvedHref = examId ? `${href}?exam=${examId}` : href;
          const isActive =
            activePage === label.toLowerCase() ||
            pathname === href ||
            (pathname !== null && pathname.startsWith(href + "/"));

          return (
            <Link
              key={label}
              href={resolvedHref}
              title={collapsed ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 1rem",
                textDecoration: "none",
                color: isActive ? "var(--accent-cyan)" : "var(--text-muted)",
                backgroundColor: isActive ? "rgba(0,229,255,0.06)" : "transparent",
                borderLeft: isActive
                  ? "2px solid var(--accent-cyan)"
                  : "2px solid transparent",
                transition: "background-color 0.15s, color 0.15s",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ borderTop: "1px solid var(--border-cyan)" }}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-end",
            padding: "0.75rem 1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            transition: "color 0.15s",
            width: "100%",
          }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </motion.aside>
  );
}
