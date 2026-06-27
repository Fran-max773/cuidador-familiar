import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevada?: boolean;
}

export function Card({ elevada = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5",
        elevada ? "shadow-md" : "shadow-sm border border-beige-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
