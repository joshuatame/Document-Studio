import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getSettings, isUnauthorizedError, updateSettings } from "@/lib/api";
import { redirectToAccount } from "@/lib/account";
import type { DocumentStudioSettings } from "@/types/document-studio";

interface SettingsForm {
  preferredDownloadFormat: "pdf" | "docx";
  emailNotifications: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<DocumentStudioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
      reset({
        preferredDownloadFormat: data.preferredDownloadFormat,
        emailNotifications: data.emailNotifications,
      });
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToAccount("login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  async function onSubmit(values: SettingsForm) {
    setSaving(true);
    try {
      const updated = await updateSettings(values);
      setSettings(updated);
      toast.success("Settings updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={1} className="h-8 w-48" />
        <Card>
          <LoadingSkeleton lines={6} />
        </Card>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={loadSettings} />;
  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy md:text-3xl">Settings</h1>
        <p className="mt-1 text-graphite/80">
          Manage your Document Studio preferences.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Profile</CardDescription>
            <CardTitle>{settings.profileName || "—"}</CardTitle>
            <CardDescription>{settings.profileEmail || "—"}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Credits &amp; subscription</CardDescription>
            <CardTitle>{settings.creditsRemaining} credits</CardTitle>
            <CardDescription>{settings.subscriptionLabel}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="preferredDownloadFormat">
              Preferred download format
            </Label>
            <select
              id="preferredDownloadFormat"
              className="flex h-10 w-full max-w-xs rounded-lg border border-steel bg-white px-3 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
              {...register("preferredDownloadFormat")}
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="emailNotifications"
              type="checkbox"
              className="h-4 w-4 rounded border-steel text-electric focus:ring-electric"
              {...register("emailNotifications")}
            />
            <Label htmlFor="emailNotifications">
              Email notifications for document completion
            </Label>
          </div>

          <Button type="submit" loading={saving}>
            Save preferences
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Billing management will be available when the backend provides a
            billing portal.
          </CardDescription>
        </CardHeader>
        {settings.billingPortalUrl ? (
          <a
            href={settings.billingPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-electric hover:underline"
          >
            Open billing portal
          </a>
        ) : (
          <p className="text-sm text-graphite/70">No billing portal configured.</p>
        )}
      </Card>
    </div>
  );
}
