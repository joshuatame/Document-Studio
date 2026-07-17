import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ErrorState } from "@/components/document-studio/error-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getGenerationStatus,
  isUnauthorizedError,
  triggerGeneration,
} from "@/lib/api";
import type { DocumentStudioGenerationStatus } from "@/types/document-studio";

const POLL_INTERVAL_MS = 3000;

export default function GeneratingPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<DocumentStudioGenerationStatus>("queued");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Starting generation…");
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async () => {
    try {
      const data = await getGenerationStatus(documentId);
      setStatus(data.generationStatus);
      setProgress(data.progress ?? 0);
      setMessage(data.message ?? getStatusMessage(data.generationStatus));

      if (data.generationStatus === "completed") {
        stopPolling();
        navigate(`/download/${documentId}`, { replace: true });
      } else if (data.generationStatus === "failed") {
        stopPolling();
        setError(data.error ?? "Document generation failed");
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        stopPolling();
        navigate("/login", { replace: true });
        return;
      }
      // Keep polling on transient network errors
    }
  }, [documentId, navigate, stopPolling]);

  const startGeneration = useCallback(async () => {
    setError(null);
    setRetrying(true);
    try {
      const data = await triggerGeneration(documentId);
      setStatus(data.generationStatus);
      setProgress(data.progress ?? 0);
      setMessage(data.message ?? getStatusMessage(data.generationStatus));

      if (data.generationStatus === "completed") {
        navigate(`/download/${documentId}`, { replace: true });
        return;
      }

      if (data.generationStatus === "failed") {
        setError(data.error ?? "Document generation failed");
        return;
      }

      stopPolling();
      pollRef.current = setInterval(() => {
        void pollStatus();
      }, POLL_INTERVAL_MS);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to start generation");
    } finally {
      setRetrying(false);
    }
  }, [documentId, navigate, pollStatus, stopPolling]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void startGeneration();
    }
    return () => stopPolling();
  }, [startGeneration, stopPolling]);

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState message={error} onRetry={startGeneration} />
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate("/")}>
            Return to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy">Generating your document</h1>
        <p className="mt-1 text-graphite/80">
          Please wait while Document Studio prepares your draft.
        </p>
      </div>

      <Card className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-electric" />
        </div>
        <p className="mb-2 text-lg font-medium capitalize text-navy">
          {status.replace("_", " ")}
        </p>
        <p className="mb-6 text-sm text-graphite/70">{message}</p>
        <div className="h-2 overflow-hidden rounded-full bg-steel/60">
          <div
            className="h-full rounded-full bg-electric transition-all duration-500"
            style={{ width: `${Math.max(progress, status === "running" ? 10 : 5)}%` }}
          />
        </div>
        {retrying && (
          <p className="mt-4 text-sm text-graphite/70">Retrying…</p>
        )}
      </Card>
    </div>
  );
}

function getStatusMessage(status: DocumentStudioGenerationStatus): string {
  switch (status) {
    case "queued":
      return "Your document is queued for generation…";
    case "running":
      return "AI agents are generating your document…";
    case "completed":
      return "Generation complete!";
    case "failed":
      return "Generation failed.";
    default:
      return "Processing…";
  }
}
