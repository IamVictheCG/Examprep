import { ReactNode } from "react";
import DashboardNav from "@/components/layout/DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DashboardNav />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
