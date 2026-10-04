import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminOrders } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminOrder } from "@/types/admin";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getAdminOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
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
      <AdminPageHeader title="Orders" description="View payment and checkout orders." />

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-navy">
                  {order.templateTitle ?? order.documentId}
                </p>
                <p className="text-sm text-graphite/70">
                  {order.userEmail ?? "—"} · {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-navy">
                  {formatCurrency(order.amountCents, order.currency)}
                </span>
                <Badge variant="primary">{order.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {orders.length === 0 && (
          <Card className="py-8 text-center text-sm text-graphite/70">
            No orders yet.
          </Card>
        )}
      </div>
    </div>
  );
}
