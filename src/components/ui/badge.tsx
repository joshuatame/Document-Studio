import { cn } from "@/lib/utils";

const variantStyles = {
  default: "bg-steel/50 text-navy",
  primary: "bg-electric/10 text-electric",
  success: "bg-success/10 text-success",
  warning: "bg-alert/10 text-alert",
  error: "bg-error/10 text-error",
  indigo: "bg-indigo/10 text-indigo",
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variantStyles;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
