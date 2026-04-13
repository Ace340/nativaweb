"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-wood)] text-[var(--color-forest)] hover:from-[rgba(216,187,124,0.95)] hover:to-[rgba(99,71,39,0.9)]",
  secondary:
    "bg-[rgba(189,188,178,0.08)] border border-[rgba(189,188,178,0.35)] text-[var(--text-primary)] hover:bg-[rgba(189,188,178,0.2)]",
  ghost: "bg-transparent text-[var(--text-primary)] hover:text-[var(--color-gold)]",
};

const sizeVariants = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-3.5 text-lg",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizeVariants;
  asChild?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = "primary",
    size = "md",
    asChild = false,
    ...props
  },
  ref) => {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300",
          buttonVariants[variant],
          sizeVariants[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
