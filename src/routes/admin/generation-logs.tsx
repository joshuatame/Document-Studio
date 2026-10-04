import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getGenerationLogs } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { GenerationLog } from "@/types/admin";

export default function AdminGenerationLogsPage() {
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setLogs(await getGenerationLogs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <AdminPageHeader
        title="Generation logs"
        description="Monitor document generation activity."
      />

      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} padding="sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-navy">
                  {log.templateTitle ?? log.templateSlug ?? log.documentId}
                </p>
                <p className="text-sm text-graphite/70">
                  {formatDate(log.createdAt)}
                </p>
                {log.message && (
                  <p className="mt-1 text-sm text-graphite">{log.message}</p>
                )}
              </div>
              <Badge
                variant={
                  log.status === "completed"
                    ? "success"
                    : log.status === "failed"
                      ? "error"
                      : "primary"
                }
              >
                {log.status}
              </Badge>
            </div>
          </Card>
        ))}
        {logs.length === 0 && (
          <Card className="py-8 text-center text-sm text-graphite/70">
            No generation logs yet.
          </Card>
        )}
      </div>
    </div>
  );
}
