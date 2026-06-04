import type { Exam } from "@/types";

export const EXAMS: Exam[] = [
  // ── Live exams ──────────────────────────────────────────────────────────────
  { id: "ican",       name: "ICAN",            field: "Accounting",  icon: "📊", status: "live" },
  { id: "bar-finals", name: "Bar Finals",      field: "Law",         icon: "⚖️", status: "live" },
  { id: "mdcn",       name: "MDCN Licensing",  field: "Medicine",    icon: "🏥", status: "live" },
  { id: "coren",      name: "COREN",           field: "Engineering", icon: "⚙️", status: "live" },
  { id: "arcon",      name: "ARCON",           field: "Architecture",icon: "🏛️", status: "live" },
  { id: "nmcn",       name: "NMCN Licensing",  field: "Nursing",     icon: "💊", status: "live" },
  // ── Coming soon ─────────────────────────────────────────────────────────────
  { id: "cibn",  name: "CIBN",  field: "Banking",  icon: "🏦", status: "coming_soon" },
  { id: "citn",  name: "CITN",  field: "Tax",       icon: "🧾", status: "coming_soon" },
  { id: "pcn",   name: "PCN",   field: "Pharmacy", icon: "⚗️", status: "coming_soon" },
  { id: "cipm",  name: "CIPM",  field: "HR",        icon: "💼", status: "coming_soon" },
  { id: "trcn",  name: "TRCN",  field: "Teaching",  icon: "📚", status: "coming_soon" },
];
