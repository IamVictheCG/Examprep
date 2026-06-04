"use client";

import { ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";

type CardVariant = "default" | "elevated" | "highlight";

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const BASE: CSSProperties = {
  padding: "1.5rem",
  borderRadius: 12,
};

const VARIANT_STYLES: Record<CardVariant, CSSProperties> = {
  default: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-cyan)",
  },
  elevated: {
    backgroundColor: "var(--bg-surface-2)",
    border: "1px solid var(--border-cyan)",
  },
  highlight: {
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-cyan)",
  },
};

export default function Card({
  variant = "default",
  children,
  className,
  style,
  onClick,
}: CardProps) {
  const combinedStyle = { ...BASE, ...VARIANT_STYLES[variant], ...style };

  if (variant === "highlight") {
    return (
      <motion.div
        className={className}
        style={combinedStyle}
        whileHover={{
          borderColor: "var(--border-cyan-hover)",
          y: -2,
          transition: { duration: 0.2 },
        }}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={className} style={combinedStyle} onClick={onClick}>
      {children}
    </div>
  );
}
