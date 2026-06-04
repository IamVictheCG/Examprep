import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Fixed background layer */}
      <div aria-hidden="true" className="grid-bg" />
      <div aria-hidden="true" className="glow-orb" />
      <div aria-hidden="true" className="glow-orb-2" />

      {/* Content layer above background */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <main style={{ position: "relative", zIndex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
