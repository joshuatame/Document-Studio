import type { DocumentStudioStatus } from "@/types/document-studio";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  DocumentStudioStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "error" | "indigo" }
> = {
  draft: { label: "Draft", variant: "default" },
  awaiting_payment: { label: "Awaiting Payment", variant: "warning" },
  paid: { label: "Paid", variant: "primary" },
  generating: { label: "Generating", variant: "indigo" },
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "error" },
  cancelled: { label: "Cancelled", variant: "default" },
};

interface DocumentStatusBadgeProps {
  status: DocumentStudioStatus;
}

export function DocumentStatusBadge({ status }: DocumentStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
