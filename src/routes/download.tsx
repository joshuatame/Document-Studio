import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DownloadActions } from "@/components/document-studio/download-actions";
import { DocumentStatusBadge } from "@/components/document-studio/document-status-badge";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCompletedDocument, isUnauthorizedError, saveDocumentDraftContent } from "@/lib/api";
import { redirectToAccount } from "@/lib/account";
import type { CompletedDocumentResponse } from "@/types/document-studio";

export default function DownloadPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState<CompletedDocumentResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [previewText, setPreviewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDocument() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompletedDocument(documentId);
      setDocument(data);
      setPreviewText(data.previewText ?? "");
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToAccount("login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocument();
  }, [documentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={1} className="h-8 w-64" />
        <Card>
          <LoadingSkeleton lines={4} />
        </Card>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={loadDocument} />;
  if (!document) return null;

  async function savePreview() {
    setSaving(true);
    try {
      const updated = await saveDocumentDraftContent(documentId, previewText);
      setDocument(updated);
      setPreviewText(updated.previewText ?? "");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{document.title}</h1>
          <p className="mt-1 text-graphite/80">
            Your document is ready to download.
          </p>
        </div>
        <DocumentStatusBadge status={document.status} />
      </div>

      {document.previewText && (
        <Card>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-graphite/70">Editable preview</h2>
              <p className="text-xs text-graphite/60">Make final wording changes before downloading the produced PDF.</p>
            </div>
            <Button variant="outline" onClick={savePreview} loading={saving}>
              Save preview edits
            </Button>
          </div>
          <textarea
            value={previewText}
            onChange={(event) => setPreviewText(event.target.value)}
            rows={18}
            className="w-full rounded-lg border border-steel bg-white p-4 text-sm leading-relaxed text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
          />
        </Card>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-navy">Download</h2>
        <DownloadActions
          documentId={documentId}
          title={document.title}
          pdfAvailable={document.pdfAvailable}
          docxAvailable={document.docxAvailable}
        />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/select")}>Generate another document</Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to dashboard
        </Button>
      </div>
    </div>
  );
}
