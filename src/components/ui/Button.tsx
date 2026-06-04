"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--gradient-accent)",
    color: "#fff",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  outline: {
    background: "transparent",
    color: "var(--accent-cyan)",
    border: "1px solid var(--accent-cyan)",
  },
  danger: {
    background: "transparent",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.5)",
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: { fontSize: "0.75rem",  padding: "0.375rem 0.875rem", borderRadius: 6  },
  md: { fontSize: "0.875rem", padding: "0.5rem 1.25rem",    borderRadius: 8  },
  lg: { fontSize: "1rem",     padding: "0.75rem 1.75rem",   borderRadius: 10 },
};

const LOADER_SIZE: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 };

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontWeight: 600,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: disabled && !isLoading ? 0.5 : 1,
        transition: "opacity 0.2s, filter 0.2s",
        pointerEvents: isLoading ? "none" : undefined,
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        ...style,
      }}
    >
      {isLoading && (
        <Loader2 size={LOADER_SIZE[size]} className="animate-spin" />
      )}
      {children}
    </button>
  );
}
