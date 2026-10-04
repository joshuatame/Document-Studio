import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/document-studio/error-state";
import { PageSkeleton } from "@/components/document-studio/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminCategory, getAdminCategories, updateAdminCategory } from "@/lib/api";
import { toast } from "sonner";
import type { TemplateCategory } from "@/types/admin";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getAdminCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createAdminCategory({ name, slug, active: true });
      setName("");
      setSlug("");
      toast.success("Category created");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: TemplateCategory) {
    try {
      await updateAdminCategory(cat.id, { active: !cat.active });
      toast.success("Category updated");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organise templates into catalogue categories."
      />

      <Card className="mb-6 space-y-4">
        <h2 className="font-semibold text-navy">Add category</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label required>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label required>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={saving}>Add category</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {categories.map((cat) => (
          <Card key={cat.id} padding="sm" className="flex items-center justify-between">
            <div>
              <p className="font-medium text-navy">{cat.name}</p>
              <p className="text-sm text-graphite/70">{cat.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={cat.active ? "success" : "default"}>
                {cat.active ? "Active" : "Inactive"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => toggleActive(cat)}>
                Toggle
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
