type SpinnerSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<SpinnerSize, { px: number; border: number }> = {
  sm: { px: 16, border: 2 },
  md: { px: 24, border: 3 },
  lg: { px: 40, border: 4 },
};

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const { px, border } = SIZE_MAP[size];

  return (
    <div
      className={`animate-spin${className ? ` ${className}` : ""}`}
      style={{
        width: px,
        height: px,
        borderRadius: "50%",
        border: `${border}px solid rgba(0, 229, 255, 0.15)`,
        borderTopColor: "var(--accent-cyan)",
        flexShrink: 0,
      }}
    />
  );
}
