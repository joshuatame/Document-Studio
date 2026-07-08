import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentStatusBadge } from "@/components/document-studio/document-status-badge";
import { EmptyState } from "@/components/document-studio/empty-state";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Card } from "@/components/ui/card";
import { getDocumentHistory, isUnauthorizedError } from "@/lib/api";
import { formatDate, getDocumentRoute } from "@/lib/utils";
import type { DocumentHistoryResponse, DocumentStudioDocument } from "@/types/document-studio";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<DocumentHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocumentHistory();
      setHistory(data);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadHistory} />;
  if (!history) return null;

  const totalCount =
    history.drafts.length + history.completed.length + history.failed.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Document history</h1>
        <p className="mt-1 text-graphite/80">
          View drafts, completed documents, and failed generations.
        </p>
      </div>

      {totalCount === 0 ? (
        <EmptyState
          title="No document history"
          description="Documents you create will appear here."
          actionLabel="Create document"
          onAction={() => navigate("/select")}
        />
      ) : (
        <>
          <HistorySection
            title="Drafts"
            documents={history.drafts}
            onNavigate={navigate}
          />
          <HistorySection
            title="Completed"
            documents={history.completed}
            onNavigate={navigate}
          />
          <HistorySection
            title="Failed"
            documents={history.failed}
            onNavigate={navigate}
          />
        </>
      )}
    </div>
  );
}

function HistorySection({
  title,
  documents,
  onNavigate,
}: {
  title: string;
  documents: DocumentStudioDocument[];
  onNavigate: (path: string) => void;
}) {
  if (documents.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-navy">{title}</h2>
      <div className="space-y-3">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            padding="sm"
            className="flex cursor-pointer items-center justify-between transition-shadow hover:shadow-elevated"
            onClick={() => onNavigate(getDocumentRoute(doc.status, doc.id))}
          >
            <div>
              <p className="font-medium text-navy">
                {doc.title || doc.documentTypeTitle || doc.documentType}
              </p>
              <p className="text-sm text-graphite/70">
                {formatDate(doc.updatedAt || doc.createdAt)}
              </p>
            </div>
            <DocumentStatusBadge status={doc.status} />
          </Card>
        ))}
      </div>
    </section>
  );
}
