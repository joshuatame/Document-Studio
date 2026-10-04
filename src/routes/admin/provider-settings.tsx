import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getProviderSettings,
  testProviderConnection,
  updateProviderSettings,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { ProviderSettings } from "@/types/admin";

export default function AdminProviderSettingsPage() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [model, setModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProviderSettings();
      setSettings(data);
      setModel(data.model || "gpt-4o");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
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
      const payload: { provider: "openai"; model: string; apiKey?: string } = {
        provider: "openai",
        model,
      };
      if (apiKey.trim()) payload.apiKey = apiKey.trim();
      const updated = await updateProviderSettings(payload);
      setSettings(updated);
      setApiKey("");
      toast.success("Provider settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const result = await testProviderConnection();
      setSettings(result);
      toast.success("Connection test completed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(false);
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
        title="Provider settings"
        description="Configure the AI provider used for document generation."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Input value="OpenAI" disabled />
          </div>
          <div className="space-y-2">
            <Label required>Model</Label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>API key</Label>
            <Input
              type="password"
              placeholder={
                settings?.apiKeyConfigured
                  ? "Enter new key to replace (saved key is masked)"
                  : "Enter API key"
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
            {settings?.maskedApiKey && (
              <p className="text-sm text-graphite/70">
                Saved key: {settings.maskedApiKey}
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold text-navy">Connection status</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-graphite">Last test:</span>
            <Badge
              variant={
                settings?.lastTestStatus === "success"
                  ? "success"
                  : settings?.lastTestStatus === "failed"
                    ? "error"
                    : "default"
              }
            >
              {settings?.lastTestStatus ?? "never"}
            </Badge>
          </div>
          {settings?.lastTestAt && (
            <p className="text-sm text-graphite/70">
              {formatDate(settings.lastTestAt)}
            </p>
          )}
          {settings?.lastTestMessage && (
            <p className="text-sm text-graphite">{settings.lastTestMessage}</p>
          )}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>Save settings</Button>
          <Button type="button" variant="outline" loading={testing} onClick={handleTest}>
            Test connection
          </Button>
        </div>
      </form>
    </div>
  );
}
