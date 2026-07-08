import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-steel/50">
        <Icon className="h-7 w-7 text-graphite/60" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-graphite/70">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  );
}
