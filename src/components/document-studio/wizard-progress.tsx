import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function WizardProgress({
  currentStep,
  totalSteps,
  label,
}: WizardProgressProps) {
  const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-navy">
          {label ?? `Step ${currentStep} of ${totalSteps}`}
        </span>
        <span className="text-graphite/70">{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-steel/60">
        <div
          className={cn(
            "h-full rounded-full bg-electric transition-all duration-300"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
