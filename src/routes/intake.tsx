import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { IntakeQuestionRenderer } from "@/components/document-studio/intake-question-renderer";
import { WizardProgress } from "@/components/document-studio/wizard-progress";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createDocument,
  getDocumentTypes,
  isUnauthorizedError,
  saveDocumentIntake,
} from "@/lib/api";
import { redirectToAccount } from "@/lib/account";
import {
  getLocalDocumentType,
  getLocalIntakeQuestions,
  LOCAL_CATALOG,
} from "@/lib/catalog";
import type {
  DocumentStudioAnswer,
  DocumentStudioQuestion,
} from "@/types/document-studio";

function buildSchema(questions: DocumentStudioQuestion[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of questions) {
    let fieldSchema: z.ZodTypeAny;

    switch (q.type) {
      case "checkbox":
        fieldSchema = q.required
          ? z.literal(true, { errorMap: () => ({ message: "Required" }) })
          : z.boolean().optional();
        break;
      case "email":
        fieldSchema = q.required
          ? z.string().email("Invalid email")
          : z.string().email("Invalid email").optional().or(z.literal(""));
        break;
      case "number":
        fieldSchema = q.required
          ? z.coerce.number({ invalid_type_error: "Must be a number" })
          : z.coerce.number().optional();
        break;
      default:
        fieldSchema = z.string();
        if (q.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, "Required");
        } else {
          fieldSchema = fieldSchema.optional().or(z.literal(""));
        }
        if (q.validation?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            q.validation.minLength,
            `Minimum ${q.validation.minLength} characters`
          );
        }
        if (q.validation?.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            q.validation.maxLength,
            `Maximum ${q.validation.maxLength} characters`
          );
        }
    }

    shape[q.id] = fieldSchema;
  }

  return z.object(shape);
}

export default function IntakePage() {
  const { documentType = "" } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<DocumentStudioQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schema = useMemo(
    () => (questions.length ? buildSchema(questions) : z.object({})),
    [questions]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let docQuestions: DocumentStudioQuestion[] = [];
        let docTitle = "";

        try {
          const types = await getDocumentTypes();
          const match =
            types.find((t) => t.slug === documentType) ??
            LOCAL_CATALOG.find((t) => t.slug === documentType);
          if (match) {
            docTitle = match.title;
            docQuestions = match.questions ?? getLocalIntakeQuestions(documentType);
          }
        } catch {
          const local = getLocalDocumentType(documentType);
          if (local) {
            docTitle = local.title;
            docQuestions = getLocalIntakeQuestions(documentType);
          }
        }

        if (!docTitle) {
          setError("Document type not found");
          return;
        }

        setTitle(docTitle);
        setQuestions(docQuestions);
      } catch (err) {
        if (isUnauthorizedError(err)) {
          redirectToAccount("login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load intake");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [documentType, navigate]);

  async function onSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    try {
      const createResponse = await createDocument(documentType);
      const documentId = createResponse.documentId;

      const answers: DocumentStudioAnswer[] = questions.map((q) => ({
        questionId: q.id,
        value: values[q.id] as DocumentStudioAnswer["value"],
      }));

      await saveDocumentIntake(documentId, answers);
      toast.success("Intake saved");
      navigate(`/review/${documentId}`);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        redirectToAccount("login");
        return;
      }
      toast.error(err instanceof Error ? err.message : "Failed to save intake");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={1} className="h-8 w-64" />
        <Card>
          <LoadingSkeleton lines={8} />
        </Card>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate("/select")} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-1 text-graphite/80">
          Complete the guided intake below. Your answers will be used by the
          studio to generate your document draft.
        </p>
      </div>

      <WizardProgress currentStep={1} totalSteps={3} label="Intake" />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <IntakeQuestionRenderer
            questions={questions}
            control={control}
            errors={errors}
          />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/select")}
            >
              Back
            </Button>
            <Button type="submit" loading={submitting}>
              Continue to review
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
