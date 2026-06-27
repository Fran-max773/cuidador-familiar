import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "peligro" | "fantasma";
  tamaño?: "sm" | "md" | "lg";
}

export function Button({
  variante = "primario",
  tamaño = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-sage-500 text-white hover:bg-sage-600 focus:ring-sage-400":
            variante === "primario",
          "bg-beige-100 text-gray-700 hover:bg-beige-200 focus:ring-sage-300 border border-beige-200":
            variante === "secundario",
          "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-300":
            variante === "peligro",
          "text-gray-500 hover:text-gray-700 hover:bg-beige-100 focus:ring-sage-300":
            variante === "fantasma",
        },
        {
          "px-3 py-1.5 text-sm": tamaño === "sm",
          "px-5 py-3 text-base": tamaño === "md",
          "px-7 py-4 text-lg": tamaño === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
