import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
        <AlertCircle className="h-7 w-7 text-error" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-graphite/70">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}
