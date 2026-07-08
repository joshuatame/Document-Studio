export type DocumentStudioStatus =
  | "draft"
  | "awaiting_payment"
  | "paid"
  | "generating"
  | "completed"
  | "failed"
  | "cancelled";

export type DocumentStudioGenerationStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type DocumentStudioPaymentStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "failed"
  | "cancelled";

export type DocumentStudioQuestionType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "date"
  | "select"
  | "multiselect"
  | "checkbox"
  | "number"
  | "url";

export interface DocumentStudioQuestion {
  id: string;
  type: DocumentStudioQuestionType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface DocumentTypeSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  priceCents: number;
  currency: string;
  icon: string;
  questions?: DocumentStudioQuestion[];
}

export interface DocumentStudioAnswer {
  questionId: string;
  value: string | string[] | boolean | number;
}

export interface DocumentStudioDocument {
  id: string;
  documentType: string;
  documentTypeTitle?: string;
  title?: string;
  status: DocumentStudioStatus;
  paymentStatus?: DocumentStudioPaymentStatus;
  generationStatus?: DocumentStudioGenerationStatus;
  answers?: DocumentStudioAnswer[];
  createdAt: string;
  updatedAt: string;
  priceCents?: number;
  currency?: string;
}

export interface DocumentStudioDashboard {
  creditsRemaining: number;
  subscriptionLabel: string;
  recentDocuments: DocumentStudioDocument[];
  draftDocuments: DocumentStudioDocument[];
  completedDocuments: DocumentStudioDocument[];
  recentDownloads: DocumentStudioDocument[];
}

export interface DocumentStudioReview {
  documentId: string;
  documentType: string;
  documentTypeTitle: string;
  title: string;
  status: DocumentStudioStatus;
  answers: DocumentStudioAnswer[];
  questions: DocumentStudioQuestion[];
  priceCents: number;
  currency: string;
}

export interface DocumentStudioSettings {
  profileName?: string;
  profileEmail?: string;
  subscriptionLabel: string;
  creditsRemaining: number;
  preferredDownloadFormat: "pdf" | "docx";
  emailNotifications: boolean;
  billingPortalUrl?: string;
}

export interface CreateDocumentResponse {
  documentId: string;
  status: DocumentStudioStatus;
  questions?: DocumentStudioQuestion[];
}

export interface CheckoutResponse {
  checkoutUrl?: string;
  paymentStatus: DocumentStudioPaymentStatus;
  priceCents: number;
  currency: string;
}

export interface GenerationStatusResponse {
  generationStatus: DocumentStudioGenerationStatus;
  progress?: number;
  message?: string;
  error?: string;
}

export interface CompletedDocumentResponse {
  documentId: string;
  title: string;
  status: DocumentStudioStatus;
  previewText?: string;
  pdfAvailable: boolean;
  docxAvailable: boolean;
}

export interface DocumentHistoryResponse {
  drafts: DocumentStudioDocument[];
  completed: DocumentStudioDocument[];
  failed: DocumentStudioDocument[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
