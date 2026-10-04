import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminPricing, updateAdminPricing } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { TemplatePricing } from "@/types/admin";

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<TemplatePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setPricing(await getAdminPricing());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(item: TemplatePricing) {
    setSavingId(item.templateId);
    try {
      await updateAdminPricing(item.templateId, item);
      toast.success("Pricing updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  function updateItem(templateId: string, patch: Partial<TemplatePricing>) {
    setPricing((prev) =>
      prev.map((p) => (p.templateId === templateId ? { ...p, ...patch } : p))
    );
  }

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <AdminPageHeader
        title="Pricing"
        description="Set template prices and Stripe product mappings."
      />

      <Card className="mb-6 border-alert/30 bg-alert/5" padding="sm">
        <p className="text-sm text-graphite">
          Prices shown to users always come from the backend. Changes here update
          what customers see at checkout.
        </p>
      </Card>

      <div className="space-y-4">
        {pricing.map((item) => (
          <Card key={item.templateId} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-navy">{item.templateTitle}</h3>
              <span className="text-sm text-graphite">
                {item.isFree ? "Free" : formatCurrency(item.priceCents, item.currency)}
              </span>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.isFree}
                onChange={(e) =>
                  updateItem(item.templateId, { isFree: e.target.checked })
                }
              />
              Free template
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Price (cents)</Label>
                <Input
                  type="number"
                  disabled={item.isFree}
                  value={item.priceCents}
                  onChange={(e) =>
                    updateItem(item.templateId, {
                      priceCents: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={item.currency || "AUD"} disabled />
              </div>
              <div className="space-y-2">
                <Label>Stripe product ID</Label>
                <Input
                  value={item.stripeProductId ?? ""}
                  onChange={(e) =>
                    updateItem(item.templateId, {
                      stripeProductId: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stripe price ID</Label>
                <Input
                  value={item.stripePriceId ?? ""}
                  onChange={(e) =>
                    updateItem(item.templateId, {
                      stripePriceId: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button
              size="sm"
              loading={savingId === item.templateId}
              onClick={() => save(item)}
            >
              Save pricing
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
