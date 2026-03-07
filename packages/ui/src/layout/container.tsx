import * as React from "react";

import { cn } from "../utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "content" | "wide" | "ultrawide" | "full";
}

function Container({ size = "content", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "content" && "max-w-content",
        size === "wide" && "max-w-wide",
        size === "ultrawide" && "max-w-ultrawide",
        size === "full" && "max-w-full",
        className,
      )}
      {...props}
    />
  );
}

export { Container };
