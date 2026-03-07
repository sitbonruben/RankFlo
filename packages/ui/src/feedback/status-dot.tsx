import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../utils";

const statusDotVariants = cva("inline-block rounded-full", {
  variants: {
    status: {
      active: "bg-accent shadow-[0_0_6px_rgba(57,255,20,0.5)]",
      inactive: "bg-gray-600",
      error: "bg-error",
      warning: "bg-warning",
    },
    size: {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    },
  },
  defaultVariants: {
    status: "active",
    size: "md",
  },
});

interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {}

function StatusDot({ className, status, size, ...props }: StatusDotProps) {
  return (
    <span
      className={cn(statusDotVariants({ status, size }), className)}
      {...props}
    />
  );
}

export { StatusDot };
