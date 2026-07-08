import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FilePlus, History, Settings } from "lucide-react";
import { DocumentStatusBadge } from "@/components/document-studio/document-status-badge";
import { EmptyState } from "@/components/document-studio/empty-state";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard, isUnauthorizedError } from "@/lib/api";
import { formatDate, getDocumentRoute } from "@/lib/utils";
import type { DocumentStudioDashboard } from "@/types/document-studio";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DocumentStudioDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await getDashboard();
      setData(dashboard);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const hasDocuments =
    data.recentDocuments.length > 0 ||
    data.draftDocuments.length > 0 ||
    data.completedDocuments.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy md:text-3xl">
            Welcome to Document Studio
          </h1>
          <p className="mt-1 text-graphite/80">
            Create professional documents with guided intake and AI generation.
          </p>
        </div>
        <Button onClick={() => navigate("/select")}>
          <FilePlus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Credits remaining</CardDescription>
            <CardTitle className="text-3xl text-electric">
              {data.creditsRemaining}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Subscription</CardDescription>
            <CardTitle className="text-xl">
              {data.subscriptionLabel || "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 rounded-lg border border-steel bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-steel/30"
        >
          <History className="h-4 w-4" />
          View history
        </Link>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-steel bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-steel/30"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      {!hasDocuments ? (
        <EmptyState
          title="No documents yet"
          description="Start your first document by selecting a template type."
          actionLabel="Create document"
          onAction={() => navigate("/select")}
        />
      ) : (
        <div className="space-y-8">
          {data.draftDocuments.length > 0 && (
            <DocumentSection
              title="Drafts"
              documents={data.draftDocuments}
            />
          )}
          {data.recentDocuments.length > 0 && (
            <DocumentSection
              title="Recent documents"
              documents={data.recentDocuments}
            />
          )}
          {data.completedDocuments.length > 0 && (
            <DocumentSection
              title="Completed"
              documents={data.completedDocuments}
            />
          )}
          {data.recentDownloads.length > 0 && (
            <DocumentSection
              title="Recent downloads"
              documents={data.recentDownloads}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DocumentSection({
  title,
  documents,
}: {
  title: string;
  documents: DocumentStudioDashboard["recentDocuments"];
}) {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-navy">{title}</h2>
      <div className="space-y-3">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            padding="sm"
            className="flex cursor-pointer items-center justify-between transition-shadow hover:shadow-elevated"
            onClick={() => navigate(getDocumentRoute(doc.status, doc.id))}
          >
            <div>
              <p className="font-medium text-navy">
                {doc.title || doc.documentTypeTitle || doc.documentType}
              </p>
              <p className="text-sm text-graphite/70">
                Updated {formatDate(doc.updatedAt)}
              </p>
            </div>
            <DocumentStatusBadge status={doc.status} />
          </Card>
        ))}
      </div>
    </section>
  );
}
