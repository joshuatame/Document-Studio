import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DocumentStatusBadge } from "@/components/document-studio/document-status-badge";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDocumentReview, isUnauthorizedError } from "@/lib/api";
import { redirectToAccount } from "@/lib/account";
import { formatCurrency } from "@/lib/utils";
import type { DocumentStudioReview } from "@/types/document-studio";

export default function ReviewPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<DocumentStudioReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReview() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocumentReview(documentId);
      setReview(data);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToAccount("login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load review");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReview();
  }, [documentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={1} className="h-8 w-64" />
        <Card>
          <LoadingSkeleton lines={6} />
        </Card>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={loadReview} />;
  if (!review) return null;

  const questionMap = new Map(review.questions.map((q) => [q.id, q]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Review your answers</h1>
          <p className="mt-1 text-graphite/80">
            Confirm your intake before generating your draft.
          </p>
        </div>
        <DocumentStatusBadge status={review.status} />
      </div>

      <Card className="space-y-4">
        <div>
          <p className="text-sm text-graphite/70">Document type</p>
          <p className="font-medium text-navy">{review.documentTypeTitle}</p>
        </div>
        <div>
          <p className="text-sm text-graphite/70">Title</p>
          <p className="font-medium text-navy">{review.title}</p>
        </div>
        <div>
          <p className="text-sm text-graphite/70">Price</p>
          <p className="font-medium text-navy">
            {formatCurrency(review.priceCents, review.currency)}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-navy">Your answers</h2>
        <dl className="space-y-4">
          {review.answers.map((answer) => {
            const question = questionMap.get(answer.questionId);
            const label = question?.label ?? answer.questionId;
            const displayValue = Array.isArray(answer.value)
              ? answer.value.join(", ")
              : typeof answer.value === "boolean"
                ? answer.value
                  ? "Yes"
                  : "No"
                : String(answer.value ?? "—");

            return (
              <div key={answer.questionId} className="border-b border-steel/40 pb-4 last:border-0 last:pb-0">
                <dt className="text-sm font-medium text-graphite/70">{label}</dt>
                <dd className="mt-1 text-navy">{displayValue}</dd>
              </div>
            );
          })}
        </dl>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/select")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => navigate(`/generating/${documentId}`)}>
          Generate document
        </Button>
      </div>
    </div>
  );
}
