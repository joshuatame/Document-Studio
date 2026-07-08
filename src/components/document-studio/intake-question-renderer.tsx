import {
  type Control,
  Controller,
  type FieldErrors,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DocumentStudioQuestion } from "@/types/document-studio";

interface IntakeQuestionRendererProps {
  questions: DocumentStudioQuestion[];
  control: Control<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
}

export function IntakeQuestionRenderer({
  questions,
  control,
  errors,
}: IntakeQuestionRendererProps) {
  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="space-y-2">
          <Label htmlFor={question.id} required={question.required}>
            {question.label}
          </Label>
          {question.description && (
            <p className="text-sm text-graphite/70">{question.description}</p>
          )}
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => {
              const error = errors[question.id];
              const hasError = Boolean(error);

              switch (question.type) {
                case "textarea":
                  return (
                    <textarea
                      id={question.id}
                      rows={4}
                      placeholder={question.placeholder}
                      className={cn(
                        "flex w-full rounded-lg border border-steel bg-white px-3 py-2 text-sm text-navy placeholder:text-graphite/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-1",
                        hasError && "border-error focus-visible:ring-error"
                      )}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );

                case "select":
                  return (
                    <select
                      id={question.id}
                      className={cn(
                        "flex h-10 w-full rounded-lg border border-steel bg-white px-3 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-1",
                        hasError && "border-error focus-visible:ring-error"
                      )}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      <option value="">Select an option…</option>
                      {question.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );

                case "checkbox":
                  return (
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        id={question.id}
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-steel text-electric focus:ring-electric"
                        checked={Boolean(field.value)}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                      />
                      <span className="text-sm text-graphite">
                        {question.label}
                      </span>
                    </label>
                  );

                case "date":
                  return (
                    <Input
                      id={question.id}
                      type="date"
                      error={hasError}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );

                case "number":
                  return (
                    <Input
                      id={question.id}
                      type="number"
                      placeholder={question.placeholder}
                      error={hasError}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );

                case "email":
                  return (
                    <Input
                      id={question.id}
                      type="email"
                      placeholder={question.placeholder}
                      error={hasError}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );

                case "phone":
                  return (
                    <Input
                      id={question.id}
                      type="tel"
                      placeholder={question.placeholder}
                      error={hasError}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );

                case "url":
                  return (
                    <Input
                      id={question.id}
                      type="url"
                      placeholder={question.placeholder}
                      error={hasError}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );

                default:
                  return (
                    <Input
                      id={question.id}
                      type="text"
                      placeholder={question.placeholder}
                      error={hasError}
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );
              }
            }}
          />
          {errors[question.id] && (
            <p className="text-sm text-error">
              {String(errors[question.id]?.message)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
