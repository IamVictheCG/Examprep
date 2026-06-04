"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardWrapper from "@/components/layout/DashboardWrapper";
import Button from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

// ─── Design-system colours ────────────────────────────────────────────────────
const CYAN   = "#00e5ff";
const BORDER = "rgba(0,229,255,0.12)";

// MOCK DATA - replace with API call in Backend Phase 4
const MOCK_USER = { fullName: "Chukwuemeka Obi", email: "chukwuemeka@example.com" };
const MOCK_SUBS = [
  { examId: "ican",       name: "ICAN",      icon: "📊", renewal: "1 Jul 2026"  },
  { examId: "bar-finals", name: "Bar Finals",icon: "⚖️", renewal: "15 Jul 2026" },
];
const MOCK_BILLING = [
  { date: "1 Jun 2026",  exam: "ICAN",       amount: "₦15,000", status: "Paid"    },
  { date: "1 Jun 2026",  exam: "Bar Finals", amount: "₦15,000", status: "Paid"    },
  { date: "1 May 2026",  exam: "ICAN",       amount: "₦15,000", status: "Paid"    },
  { date: "1 May 2026",  exam: "Bar Finals", amount: "₦15,000", status: "Paid"    },
];
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_STYLE: React.CSSProperties = {
  borderBottom: `1px solid ${BORDER}`,
  paddingBottom: "2rem",
  marginBottom: "2rem",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
      {children}
    </h2>
  );
}

function InputField({
  label, type = "text", value, onChange, placeholder,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)" }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`,
          color: "var(--text-primary)", borderRadius: 8, padding: "0.75rem 1rem",
          fontSize: "0.9rem", outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = CYAN)}
        onBlur={(e)  => (e.currentTarget.style.borderColor = BORDER)}
      />
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 42, height: 22, borderRadius: 999, cursor: "pointer", padding: 2,
        backgroundColor: on ? CYAN : "var(--bg-surface)",
        border: `1px solid ${on ? CYAN : BORDER}`,
        position: "relative", transition: "background-color 0.2s",
        display: "flex", alignItems: "center",
      }}
    >
      <motion.span
        animate={{ x: on ? 18 : 0 }}
        transition={{ duration: 0.18 }}
        style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", display: "block" }}
      />
    </button>
  );
}

export default function AccountPage() {
  const initials = MOCK_USER.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Profile
  const [fullName, setFullName] = useState(MOCK_USER.fullName);
  const [email,    setEmail]    = useState(MOCK_USER.email);

  // Password
  const [curPw,    setCurPw]    = useState("");
  const [newPw,    setNewPw]    = useState("");
  const [confPw,   setConfPw]   = useState("");
  const [showPw,   setShowPw]   = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    studyReminders: true,
    streakAlerts: true,
    newContent: false,
  });
  function toggleNotif(key: keyof typeof notifs) {
    setNotifs((n) => ({ ...n, [key]: !n[key] }));
  }

  // Danger zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput,     setDeleteInput]     = useState("");

  return (
    <DashboardWrapper>
      <div style={{ maxWidth: 640 }}>
        <h1 className="font-heading" style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2rem" }}>
          Account Settings
        </h1>

        {/* ── Profile ─────────────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <SectionHeading>Profile</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.25rem" }}>
            {/* Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
              <div
                style={{
                  width: 80, height: 80, borderRadius: "50%",
                  backgroundColor: "rgba(0,229,255,0.08)",
                  border: `2px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", fontWeight: 700, color: CYAN,
                }}
              >
                {initials}
              </div>
              <Button variant="ghost" size="sm" onClick={() => console.log("Upload photo")}>
                Upload Photo
              </Button>
            </div>
            <div style={{ display: "grid", gap: "0.875rem", width: "100%" }}>
              <InputField label="Full Name"      value={fullName} onChange={setFullName} />
              <InputField label="Email Address"  value={email}    onChange={setEmail} type="email" />
            </div>
            <Button variant="outline" size="sm" onClick={() => console.log("Save profile", { fullName, email })}>
              Save Changes
            </Button>
          </div>
        </div>

        {/* ── Subscriptions ────────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <SectionHeading>My Subscriptions</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {MOCK_SUBS.map((s) => (
              <div
                key={s.examId}
                style={{
                  display: "flex", alignItems: "center", gap: "0.875rem",
                  backgroundColor: "var(--bg-surface)", border: `1px solid ${BORDER}`,
                  borderRadius: 10, padding: "0.875rem 1.25rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <p className="font-heading" style={{ color: "var(--text-primary)", fontWeight: 600 }}>{s.name}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Renews {s.renewal}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => console.log("Cancel", s.examId)}>
                  Cancel
                </Button>
              </div>
            ))}
            <div style={{ marginTop: "0.25rem" }}>
              <Button variant="outline" size="sm" onClick={() => console.log("Add exam")}>
                + Add Exam
              </Button>
            </div>
          </div>
        </div>

        {/* ── Billing History ───────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <SectionHeading>Billing History</SectionHeading>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                padding: "0.6rem 1rem",
                backgroundColor: "var(--bg-surface-2)",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              {["Date", "Exam", "Amount", "Status", "Receipt"].map((h) => (
                <span key={h} style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </span>
              ))}
            </div>
            {MOCK_BILLING.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                  padding: "0.75rem 1rem",
                  backgroundColor: i % 2 === 0 ? "var(--bg-surface)" : "var(--bg-surface-2)",
                  borderBottom: i < MOCK_BILLING.length - 1 ? `1px solid ${BORDER}` : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{row.date}</span>
                <span style={{ color: "var(--text-primary)", fontSize: "0.82rem" }}>{row.exam}</span>
                <span style={{ color: "var(--text-primary)", fontSize: "0.82rem" }}>{row.amount}</span>
                <span style={{ color: "#22c55e", fontSize: "0.75rem", fontWeight: 600 }}>{row.status}</span>
                <button onClick={() => console.log("Download receipt", row)} style={{ background: "none", border: "none", color: CYAN, fontSize: "0.8rem", cursor: "pointer", padding: 0 }}>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Change Password ───────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <SectionHeading>Change Password</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ position: "relative" }}>
              <InputField label="Current Password" type={showPw ? "text" : "password"} value={curPw} onChange={setCurPw} placeholder="••••••••" />
              <button onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: "0.75rem", top: "2rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <InputField label="New Password"     type="password" value={newPw}  onChange={setNewPw}  placeholder="Min. 8 characters" />
            <InputField label="Confirm Password" type="password" value={confPw} onChange={setConfPw} placeholder="Repeat new password" />
            <Button variant="primary" size="sm" style={{ alignSelf: "flex-start" }} onClick={() => console.log("Update password", { curPw, newPw, confPw })}>
              Update Password
            </Button>
          </div>
        </div>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <div style={SECTION_STYLE}>
          <SectionHeading>Notifications</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { key: "studyReminders" as const, label: "Email study reminders",     desc: "Daily reminders to keep your streak alive" },
              { key: "streakAlerts"   as const, label: "Streak alerts",             desc: "Notify me when my streak is at risk" },
              { key: "newContent"     as const, label: "New content notifications", desc: "When new questions are added to my exams" },
            ].map((n) => (
              <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>{n.label}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{n.desc}</p>
                </div>
                <Toggle on={notifs[n.key]} onToggle={() => toggleNotif(n.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Danger Zone ───────────────────────────────────────────────── */}
        <div
          style={{
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12,
            padding: "1.5rem",
          }}
        >
          <h2 className="font-heading" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.75rem" }}>
            Danger Zone
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      {/* ── Delete confirmation modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            key="delete-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(3,5,15,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                backgroundColor: "var(--bg-surface-2)",
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: "2rem",
                maxWidth: 420,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h2 className="font-heading" style={{ color: "#ef4444", fontWeight: 800, fontSize: "1.2rem" }}>
                Delete your account?
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                This will permanently remove all your data, subscriptions, and progress. Type{" "}
                <strong style={{ color: "var(--text-primary)" }}>DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                style={{
                  backgroundColor: "var(--bg-surface)", border: `1px solid rgba(239,68,68,0.4)`,
                  color: "var(--text-primary)", borderRadius: 8, padding: "0.75rem 1rem",
                  fontSize: "0.9rem", outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }} style={{ flex: 1, justifyContent: "center" }}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  disabled={deleteInput !== "DELETE"}
                  onClick={() => console.log("Account deleted")}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Delete Forever
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardWrapper>
  );
}
