import { ReactNode } from "react";
import DashboardNav from "./DashboardNav";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardWrapperProps {
  children: ReactNode;
  examId?: string;
  activePage?: string;
  userName?: string;
  avatarUrl?: string;
}

export default function DashboardWrapper({
  children,
  examId,
  activePage,
  userName,
  avatarUrl,
}: DashboardWrapperProps) {
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
      <DashboardNav userName={userName} avatarUrl={avatarUrl} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <DashboardSidebar examId={examId} activePage={activePage} />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
            minWidth: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
