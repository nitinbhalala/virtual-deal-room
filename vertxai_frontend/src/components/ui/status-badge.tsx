
import React from "react";
import { cn } from "@/lib/utils";

type DealStatus = "pending" | "progress" | "completed" | "cancelled";

type StatusBadgeProps = {
  status: DealStatus;
  className?: string;
};

const statusConfig = {
  pending: {
    label: "Pending",
    className: "deal-status-pending",
  },
  progress: {
    label: "In Progress",
    className: "deal-status-progress",
  },
  completed: {
    label: "Completed",
    className: "deal-status-completed",
  },
  cancelled: {
    label: "Cancelled",
    className: "deal-status-cancelled",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
