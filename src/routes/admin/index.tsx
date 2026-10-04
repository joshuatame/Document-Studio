import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/api";
import type { AdminOverview } from "@/types/admin";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load overview");
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
        title="Admin overview"
        description="Manage templates, pricing, and platform settings."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Templates" value={data?.templateCount ?? 0} />
        <StatCard label="Active templates" value={data?.activeTemplateCount ?? 0} />
        <StatCard label="Orders" value={data?.orderCount ?? 0} />
        <StatCard label="Generations" value={data?.generationCount ?? 0} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/admin/templates/new"
          className="inline-flex h-10 items-center rounded-lg bg-electric px-4 text-sm font-medium text-white hover:bg-electric/90"
        >
          New template
        </Link>
        <Link
          to="/admin/templates"
          className="inline-flex h-10 items-center rounded-lg border border-steel bg-white px-4 text-sm font-medium text-navy hover:bg-steel/30"
        >
          Manage templates
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm text-graphite/70">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
