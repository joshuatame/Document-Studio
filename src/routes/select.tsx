import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TemplateTypeCard } from "@/components/document-studio/template-type-card";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Card } from "@/components/ui/card";
import { getDocumentTypes, isUnauthorizedError } from "@/lib/api";
import { LOCAL_CATALOG } from "@/lib/catalog";
import type { DocumentTypeSummary } from "@/types/document-studio";

function groupByCategory(types: DocumentTypeSummary[]) {
  const groups = new Map<string, DocumentTypeSummary[]>();

  for (const type of types) {
    const category = type.category || type.categorySlug || "General";
    const existing = groups.get(category) ?? [];
    existing.push(type);
    groups.set(category, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));
}

export default function SelectPage() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<DocumentTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFallbackNotice, setShowFallbackNotice] = useState(false);

  const grouped = useMemo(() => groupByCategory(types), [types]);

  async function loadTypes() {
    setLoading(true);
    setShowFallbackNotice(false);
    try {
      const backendTypes = await getDocumentTypes();
      if (backendTypes.length > 0) {
        setTypes(backendTypes);
      } else {
        setTypes(LOCAL_CATALOG);
        setShowFallbackNotice(true);
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate("/login", { replace: true });
        return;
      }
      setTypes(LOCAL_CATALOG);
      setShowFallbackNotice(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTypes();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy md:text-3xl">
          Select document type
        </h1>
        <p className="mt-1 text-graphite/80">
          Choose a template to begin your guided intake.
        </p>
      </div>

      {showFallbackNotice && (
        <Card className="border-alert/30 bg-alert/5" padding="sm">
          <p className="text-sm text-graphite">
            We could not load the live template catalogue. Showing temporary
            local templates.
          </p>
        </Card>
      )}

      {types.length === 0 ? (
        <ErrorState
          message="No document types are available right now."
          onRetry={loadTypes}
        />
      ) : (
        grouped.map(({ category, items }) => (
          <section key={category}>
            <h2 className="mb-4 text-lg font-semibold text-navy">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((docType) => (
                <TemplateTypeCard key={docType.slug} documentType={docType} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
