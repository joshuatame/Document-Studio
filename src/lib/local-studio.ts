import { getLocalDocumentType, getLocalIntakeQuestions, LOCAL_CATALOG } from "@/lib/catalog";
import type {
  CheckoutResponse,
  CompletedDocumentResponse,
  CreateDocumentResponse,
  DocumentHistoryResponse,
  DocumentStudioAnswer,
  DocumentStudioDashboard,
  DocumentStudioDocument,
  DocumentStudioReview,
  DocumentStudioSettings,
  DocumentTypeSummary,
  GenerationStatusResponse,
} from "@/types/document-studio";

const DOCUMENTS_KEY = "document-studio-local-documents";
const SETTINGS_KEY = "document-studio-local-settings";

type StoredDocument = DocumentStudioDocument;

function now() {
  return new Date().toISOString();
}

function readDocuments(): StoredDocument[] {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY);
    return raw ? (JSON.parse(raw) as StoredDocument[]) : [];
  } catch {
    return [];
  }
}

function writeDocuments(documents: StoredDocument[]) {
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
  } catch {
    // Best-effort local persistence only.
  }
}

function readSettings(): DocumentStudioSettings {
  const fallback: DocumentStudioSettings = {
    profileName: "Tame Dynamics customer",
    profileEmail: "",
    subscriptionLabel: "Self-serve workspace",
    creditsRemaining: 25,
    preferredDownloadFormat: "pdf",
    emailNotifications: true,
  };

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<DocumentStudioSettings>) } : fallback;
  } catch {
    return fallback;
  }
}

function writeSettings(settings: DocumentStudioSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Best-effort local persistence only.
  }
}

function findDocument(documentId: string): StoredDocument {
  const doc = readDocuments().find((item) => item.id === documentId);
  if (!doc) {
    throw new Error("Document not found");
  }
  return doc;
}

function saveDocument(document: StoredDocument) {
  const documents = readDocuments();
  const index = documents.findIndex((item) => item.id === document.id);
  if (index >= 0) {
    documents[index] = document;
  } else {
    documents.unshift(document);
  }
  writeDocuments(documents);
}

function getTypeOrThrow(slug: string): DocumentTypeSummary {
  const type = getLocalDocumentType(slug);
  if (!type) {
    throw new Error("Document type not found");
  }
  return type;
}

function buildTitle(type: DocumentTypeSummary, answers: DocumentStudioAnswer[] = []) {
  const company = answers.find((answer) => answer.questionId === "company_name")?.value;
  const companyName = typeof company === "string" && company.trim() ? company.trim() : "Untitled";
  return `${companyName} ${type.title}`;
}

function buildPreview(document: DocumentStudioDocument) {
  const type = getTypeOrThrow(document.documentType);
  const questions = getLocalIntakeQuestions(document.documentType);
  const answerMap = new Map((document.answers ?? []).map((answer) => [answer.questionId, answer.value]));
  const valueFor = (id: string) => {
    const value = answerMap.get(id);
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return value == null || value === "" ? "Not specified" : String(value);
  };

  return [
    `${document.title ?? type.title}`,
    "",
    `Document type: ${type.title}`,
    `Jurisdiction: ${valueFor("jurisdiction")}`,
    "",
    "Purpose",
    valueFor("document_purpose"),
    "",
    "Parties",
    valueFor("key_parties"),
    "",
    "Special terms",
    valueFor("special_terms"),
    "",
    "Generated draft sections",
    ...questions
      .filter((question) => !["acknowledgement", "company_name", "contact_name", "contact_email"].includes(question.id))
      .map((question) => `- ${question.label}: ${valueFor(question.id)}`),
    "",
    "This is a draft generated from your guided intake. Review it carefully before use.",
  ].join("\n");
}

function buildTextBlob(documentId: string, format: "pdf" | "docx") {
  const document = findDocument(documentId);
  const text = buildPreview(document);
  const heading = format === "pdf" ? "%PDF-DRAFT\n" : "DOCX-DRAFT\n";
  return new Blob([heading, text], {
    type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export async function localGetDocumentTypes(): Promise<DocumentTypeSummary[]> {
  return LOCAL_CATALOG.map((type) => ({
    ...type,
    questions: getLocalIntakeQuestions(type.slug),
  }));
}

export async function localGetDashboard(): Promise<DocumentStudioDashboard> {
  const documents = readDocuments().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const settings = readSettings();
  return {
    creditsRemaining: settings.creditsRemaining,
    subscriptionLabel: settings.subscriptionLabel,
    recentDocuments: documents.slice(0, 5),
    draftDocuments: documents.filter((doc) => doc.status === "draft" || doc.status === "awaiting_payment"),
    completedDocuments: documents.filter((doc) => doc.status === "completed"),
    recentDownloads: documents.filter((doc) => doc.status === "completed").slice(0, 3),
  };
}

export async function localCreateDocument(documentType: string): Promise<CreateDocumentResponse> {
  const type = getTypeOrThrow(documentType);
  const timestamp = now();
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  saveDocument({
    id,
    documentType,
    documentTypeTitle: type.title,
    title: type.title,
    status: "draft",
    paymentStatus: "not_required",
    generationStatus: "queued",
    answers: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    priceCents: type.priceCents,
    currency: type.currency,
  });
  return {
    documentId: id,
    status: "draft",
    questions: getLocalIntakeQuestions(documentType),
  };
}

export async function localSaveDocumentIntake(documentId: string, answers: DocumentStudioAnswer[]) {
  const document = findDocument(documentId);
  const type = getTypeOrThrow(document.documentType);
  const updated: DocumentStudioDocument = {
    ...document,
    title: buildTitle(type, answers),
    answers,
    status: "awaiting_payment",
    updatedAt: now(),
  };
  saveDocument(updated);
  return updated;
}

export async function localGetDocument(documentId: string) {
  return findDocument(documentId);
}

export async function localGetDocumentReview(documentId: string): Promise<DocumentStudioReview> {
  const document = findDocument(documentId);
  const type = getTypeOrThrow(document.documentType);
  return {
    documentId,
    documentType: type.slug,
    documentTypeTitle: type.title,
    title: document.title ?? type.title,
    status: document.status,
    answers: document.answers ?? [],
    questions: getLocalIntakeQuestions(type.slug),
    priceCents: type.priceCents,
    currency: type.currency,
  };
}

export async function localCreateCheckout(documentId: string): Promise<CheckoutResponse> {
  const document = findDocument(documentId);
  saveDocument({
    ...document,
    status: "paid",
    paymentStatus: "not_required",
    updatedAt: now(),
  });
  return {
    paymentStatus: "not_required",
    priceCents: document.priceCents ?? 0,
    currency: document.currency ?? "AUD",
  };
}

export async function localTriggerGeneration(documentId: string): Promise<GenerationStatusResponse> {
  const document = findDocument(documentId);
  saveDocument({
    ...document,
    status: "completed",
    generationStatus: "completed",
    updatedAt: now(),
  });
  return {
    generationStatus: "completed",
    progress: 100,
    message: "Draft generated in your browser.",
  };
}

export async function localGetGenerationStatus(): Promise<GenerationStatusResponse> {
  return {
    generationStatus: "completed",
    progress: 100,
    message: "Draft generated in your browser.",
  };
}

export async function localGetCompletedDocument(documentId: string): Promise<CompletedDocumentResponse> {
  const document = findDocument(documentId);
  return {
    documentId,
    title: document.title ?? "Generated document",
    status: "completed",
    previewText: buildPreview(document),
    pdfAvailable: true,
    docxAvailable: true,
  };
}

export async function localDownloadDocumentPdf(documentId: string) {
  return buildTextBlob(documentId, "pdf");
}

export async function localDownloadDocumentDocx(documentId: string) {
  return buildTextBlob(documentId, "docx");
}

export async function localGetDocumentHistory(): Promise<DocumentHistoryResponse> {
  const documents = readDocuments().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return {
    drafts: documents.filter((doc) => doc.status === "draft" || doc.status === "awaiting_payment"),
    completed: documents.filter((doc) => doc.status === "completed"),
    failed: documents.filter((doc) => doc.status === "failed"),
  };
}

export async function localGetSettings() {
  return readSettings();
}

export async function localUpdateSettings(payload: Partial<DocumentStudioSettings>) {
  const settings = {
    ...readSettings(),
    ...payload,
  };
  writeSettings(settings);
  return settings;
}
