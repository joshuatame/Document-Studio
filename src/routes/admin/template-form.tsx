import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminTemplate,
  getAdminCategories,
  getAdminTemplate,
  updateAdminTemplate,
} from "@/lib/api";
import type { AdminTemplate } from "@/types/admin";
import type { TemplateCategory } from "@/types/admin";

const emptyTemplate: Partial<AdminTemplate> = {
  title: "",
  slug: "",
  description: "",
  icon: "file-text",
  categoryId: "",
  estimatedMinutes: 15,
  priceCents: 0,
  currency: "AUD",
  active: true,
  productionStatus: "draft",
  requiresLegalReview: true,
  disclaimer: "",
  sortOrder: 0,
  isFree: false,
  stripeProductId: "",
  stripePriceId: "",
  promptTemplate: "",
  promptInstructions: "",
};

export default function AdminTemplateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const [form, setForm] = useState<Partial<AdminTemplate>>(emptyTemplate);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const cats = await getAdminCategories();
        setCategories(cats);
        if (!isNew && id) {
          setForm(await getAdminTemplate(id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load template");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id, isNew]);

  function update(field: keyof AdminTemplate, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const created = await createAdminTemplate(form);
        toast.success("Template created");
        navigate(`/admin/templates/${created.id}`);
      } else if (id) {
        await updateAdminTemplate(id, form);
        toast.success("Template saved");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <LoadingSkeleton lines={10} />
      </Card>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate(0)} />;
  }

  return (
    <div>
      <AdminPageHeader
        title={isNew ? "New template" : "Edit template"}
        description="Configure template metadata, intake, and generation instructions."
        action={
          <Link
            to="/admin/templates"
            className="text-sm font-medium text-electric hover:underline"
          >
            Back to templates
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-4">
          <h2 className="font-semibold text-navy">Basic details</h2>
          <Field label="Title" required>
            <Input value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <Field label="Slug" required>
            <Input value={form.slug ?? ""} onChange={(e) => update("slug", e.target.value)} />
          </Field>
          <Field label="Category">
            <select
              className="flex h-10 w-full rounded-lg border border-steel bg-white px-3 text-sm"
              value={form.categoryId ?? ""}
              onChange={(e) => update("categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              className="w-full rounded-lg border border-steel px-3 py-2 text-sm"
              value={form.description ?? ""}
              onChange={(e) => update("description", e.target.value)}
            />
          </Field>
          <Field label="Icon">
            <Input value={form.icon ?? ""} onChange={(e) => update("icon", e.target.value)} />
          </Field>
          <Field label="Sort order">
            <Input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => update("sortOrder", Number(e.target.value))}
            />
          </Field>
          <Field label="Estimated minutes">
            <Input
              type="number"
              value={form.estimatedMinutes ?? 15}
              onChange={(e) => update("estimatedMinutes", Number(e.target.value))}
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-navy">Status</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active ?? true} onChange={(e) => update("active", e.target.checked)} />
            Active
          </label>
          <Field label="Production status">
            <select
              className="flex h-10 w-full rounded-lg border border-steel bg-white px-3 text-sm"
              value={form.productionStatus ?? "draft"}
              onChange={(e) => update("productionStatus", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="production">Production</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.requiresLegalReview ?? false}
              onChange={(e) => update("requiresLegalReview", e.target.checked)}
            />
            Legal review required
          </label>
          <Field label="Disclaimer">
            <textarea
              rows={2}
              className="w-full rounded-lg border border-steel px-3 py-2 text-sm"
              value={form.disclaimer ?? ""}
              onChange={(e) => update("disclaimer", e.target.value)}
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-navy">Generation instructions</h2>
          <Field label="Prompt template">
            <textarea
              rows={4}
              className="w-full rounded-lg border border-steel px-3 py-2 text-sm font-mono"
              value={form.promptTemplate ?? ""}
              onChange={(e) => update("promptTemplate", e.target.value)}
            />
          </Field>
          <Field label="Prompt instructions">
            <textarea
              rows={4}
              className="w-full rounded-lg border border-steel px-3 py-2 text-sm"
              value={form.promptInstructions ?? ""}
              onChange={(e) => update("promptInstructions", e.target.value)}
            />
          </Field>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={saving}>
            {isNew ? "Create template" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/templates")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
