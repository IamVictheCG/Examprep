import { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardWrapperProps {
  children: ReactNode;
  examId?: string;
  activePage?: string;
}

export default function DashboardWrapper({
  children,
  examId,
  activePage,
}: DashboardWrapperProps) {
  return (
    <>
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
    </>
  );
}
