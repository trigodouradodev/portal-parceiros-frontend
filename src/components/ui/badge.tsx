/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        red: "bg-destructive-bg text-destructive",
        "red-dark": "bg-[#F7C1C1] text-[#791F1F]",
        amber: "bg-warning-bg text-warning",
        green: "bg-success-bg text-success",
        blue: "bg-brand-navy/10 text-brand-navy",
        teal: "bg-brand-navy/10 text-brand-navy",
        gray: "bg-[#F1EFE8] text-[#5F5E5A]",
        muted: "bg-muted text-muted-foreground",
        navy: "bg-brand-navy text-white",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
