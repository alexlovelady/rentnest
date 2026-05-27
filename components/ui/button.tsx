import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-primary hover:bg-primary-dark text-white": variant === "primary",
            "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10": variant === "secondary",
            "hover:bg-gray-100 text-gray-600 dark:text-gray-400 dark:hover:bg-white/10": variant === "ghost",
            "bg-red-600 hover:bg-red-700 text-white": variant === "danger",
            "text-xs px-3 py-1.5 gap-1.5": size === "sm",
            "text-sm px-4 py-2 gap-2": size === "md",
            "text-base px-6 py-3 gap-2": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
