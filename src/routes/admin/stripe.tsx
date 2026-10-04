import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStripeSettings, updateStripeSettings } from "@/lib/api";
import { toast } from "sonner";
import type { StripeSettings } from "@/types/admin";

const WEBHOOK_URL =
  "https://api.tame-dynamics.com/api/v1/document-studio/billing/webhook";

export default function AdminStripePage() {
  const [settings, setSettings] = useState<StripeSettings | null>(null);
  const [publishableKey, setPublishableKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getStripeSettings();
      setSettings(data);
      setPublishableKey(data.publishableKey ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Stripe settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateStripeSettings({ publishableKey });
      setSettings(updated);
      toast.success("Stripe settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <LoadingSkeleton lines={6} />
      </Card>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <AdminPageHeader
        title="Stripe settings"
        description="Manage Stripe checkout configuration."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-graphite">Configuration:</span>
            <Badge variant={settings?.configured ? "success" : "warning"}>
              {settings?.configured ? "Configured" : "Not configured"}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label>Publishable key</Label>
            <Input
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder="pk_live_..."
            />
          </div>
          <p className="text-sm text-graphite/70">
            Secret keys are stored securely on the backend and are never shown here.
          </p>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold text-navy">Webhook</h2>
          <div className="space-y-2">
            <Label>Webhook endpoint URL</Label>
            <Input value={settings?.webhookEndpointUrl ?? WEBHOOK_URL} readOnly />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-graphite">Webhook secret:</span>
            <Badge
              variant={settings?.webhookSecretConfigured ? "success" : "warning"}
            >
              {settings?.webhookSecretConfigured ? "Configured" : "Not configured"}
            </Badge>
          </div>
        </Card>

        <Button type="submit" loading={saving}>Save Stripe settings</Button>
      </form>
    </div>
  );
}
