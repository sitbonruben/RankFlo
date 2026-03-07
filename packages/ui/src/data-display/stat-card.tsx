import * as React from "react";

import { cn } from "../utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; trend: "up" | "down" | "neutral" };
  icon?: React.ReactNode;
  className?: string;
}

function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-gray-800 bg-gray-950 p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        {icon && <span className="text-gray-600">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "mb-1 text-xs font-medium",
              change.trend === "up" && "text-accent",
              change.trend === "down" && "text-error",
              change.trend === "neutral" && "text-gray-500",
            )}
          >
            {change.trend === "up" && "+"}
            {change.value}%
          </span>
        )}
      </div>
    </div>
  );
}

export { StatCard, type StatCardProps };
