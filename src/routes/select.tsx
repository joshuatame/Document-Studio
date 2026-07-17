import { useEffect, useState } from "react";
import { TemplateTypeCard } from "@/components/document-studio/template-type-card";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { getDocumentTypes, isUnauthorizedError } from "@/lib/api";
import { redirectToAccount } from "@/lib/account";
import { LOCAL_CATALOG } from "@/lib/catalog";
import type { DocumentTypeSummary } from "@/types/document-studio";

export default function SelectPage() {
  const [types, setTypes] = useState<DocumentTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  async function loadTypes() {
    setLoading(true);
    setError(null);
    try {
      const backendTypes = await getDocumentTypes();
      if (backendTypes.length > 0) {
        setTypes(backendTypes);
        setUsedFallback(false);
      } else {
        setTypes(LOCAL_CATALOG);
        setUsedFallback(true);
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToAccount("login");
        return;
      }
      setTypes(LOCAL_CATALOG);
      setUsedFallback(true);
      setError(
        err instanceof Error
          ? `${err.message} — showing local catalogue.`
          : "Could not load types — showing local catalogue."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTypes();
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy md:text-3xl">
          Select document type
        </h1>
        <p className="mt-1 text-graphite/80">
          Choose a template to begin your guided intake.
        </p>
        {usedFallback && error && (
          <p className="mt-2 text-sm text-alert">{error}</p>
        )}
      </div>

      {types.length === 0 ? (
        <ErrorState
          message="No document types available."
          onRetry={loadTypes}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((docType) => (
            <TemplateTypeCard key={docType.slug} documentType={docType} />
          ))}
        </div>
      )}
    </div>
  );
}
