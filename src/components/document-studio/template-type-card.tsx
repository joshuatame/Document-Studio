import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  FileText,
  Globe,
  ListChecks,
  Lock,
  Mail,
  Send,
  Shield,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { DocumentTypeSummary } from "@/types/document-studio";

const iconMap: Record<string, LucideIcon> = {
  shield: Shield,
  briefcase: Briefcase,
  "user-check": UserCheck,
  "file-text": FileText,
  lock: Lock,
  globe: Globe,
  building: Building2,
  mail: Mail,
  send: Send,
  "list-checks": ListChecks,
};

interface TemplateTypeCardProps {
  documentType: DocumentTypeSummary;
}

export function TemplateTypeCard({ documentType }: TemplateTypeCardProps) {
  const Icon = iconMap[documentType.icon] ?? FileText;

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-elevated">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-electric/10">
        <Icon className="h-5 w-5 text-electric" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy">
        {documentType.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-graphite/80">
        {documentType.description}
      </p>
      <div className="mb-4 flex items-center justify-between text-sm text-graphite">
        <span>{formatDuration(documentType.estimatedMinutes)}</span>
        <span className="font-semibold text-navy">
          {formatCurrency(documentType.priceCents, documentType.currency)}
        </span>
      </div>
      <Link
        to={`/intake/${documentType.slug}`}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-electric px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-electric/90"
      >
        Start
      </Link>
    </Card>
  );
}
