import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminTemplates } from "@/lib/api";
import type { AdminTemplate } from "@/types/admin";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await getAdminTemplates());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
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
        title="Templates"
        description="Create and manage document templates."
        action={
          <Link
            to="/admin/templates/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-electric px-4 text-sm font-medium text-white hover:bg-electric/90"
          >
            <Plus className="h-4 w-4" />
            New template
          </Link>
        }
      />

      <div className="space-y-3">
        {templates.map((t) => (
          <Link key={t.id} to={`/admin/templates/${t.id}`}>
            <Card padding="sm" className="transition-shadow hover:shadow-elevated">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-navy">{t.title}</p>
                  <p className="text-sm text-graphite/70">{t.slug}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={t.active ? "success" : "default"}>
                    {t.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="primary">{t.productionStatus}</Badge>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {templates.length === 0 && (
          <Card className="py-8 text-center text-sm text-graphite/70">
            No templates yet.
          </Card>
        )}
      </div>
    </div>
  );
}
