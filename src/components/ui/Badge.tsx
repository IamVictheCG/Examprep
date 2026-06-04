import { ReactNode } from "react";

type BadgeVariant = "live" | "coming-soon" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  live: {
    backgroundColor: "rgba(0,229,255,0.1)",
    color: "var(--accent-cyan)",
    border: "1px solid rgba(0,229,255,0.2)",
  },
  "coming-soon": {
    backgroundColor: "rgba(123,47,255,0.1)",
    color: "#a78bfa",
    border: "1px solid rgba(123,47,255,0.2)",
  },
  success: {
    backgroundColor: "rgba(34,197,94,0.1)",
    color: "#22c55e",
  },
  warning: {
    backgroundColor: "rgba(234,179,8,0.1)",
    color: "#eab308",
  },
};

export default function Badge({ variant = "live", children, className }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        fontSize: "0.65rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "0.2rem 0.6rem",
        borderRadius: 999,
        ...VARIANT_STYLES[variant],
      }}
    >
      {children}
    </span>
  );
}
