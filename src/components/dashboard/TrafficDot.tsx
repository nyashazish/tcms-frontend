import type { TrafficLight } from "@/lib/types";

interface Props {
  status: TrafficLight;
  size?: "sm" | "md";
}

const STATUS_LABELS: Record<TrafficLight, string> = {
  green: "Healthy",
  yellow: "Warning",
  red: "Critical",
};

export function TrafficDot({ status, size = "sm" }: Props) {
  return (
    <span
      className={`traffic-dot traffic-dot--${status}${size === "md" ? " traffic-dot--md" : ""}`}
      title={STATUS_LABELS[status]}
      aria-label={STATUS_LABELS[status]}
    />
  );
}
