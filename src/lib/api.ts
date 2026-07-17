import { getAccessToken } from "@/lib/auth";
import {
  localCreateCheckout,
  localCreateDocument,
  localDownloadDocumentDocx,
  localDownloadDocumentPdf,
  localGetCompletedDocument,
  localGetDashboard,
  localGetDocument,
  localGetDocumentHistory,
  localGetDocumentReview,
  localGetDocumentTypes,
  localGetGenerationStatus,
  localGetSettings,
  localSaveDocumentIntake,
  localTriggerGeneration,
  localUpdateSettings,
} from "@/lib/local-studio";
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

const API_BASE = import.meta.env.VITE_TAME_API_URL;
const APP_SLUG = import.meta.env.VITE_APP_SLUG || "document-studio";
const NAMESPACE = `${API_BASE}/document-studio`;
const USE_LOCAL_STUDIO =
  import.meta.env.VITE_DOCUMENT_STUDIO_LOCAL_ONLY !== "false" || !API_BASE;

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      error?: string;
    };
    return data.message || data.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

function buildHeaders(includeJson = true): HeadersInit {
  const headers: Record<string, string> = {
    "X-Tame-App-Slug": APP_SLUG,
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${NAMESPACE}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(options.body !== undefined),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiClientError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function downloadRequest(path: string): Promise<Blob> {
  const response = await fetch(`${NAMESPACE}${path}`, {
    headers: buildHeaders(false),
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new ApiClientError(message, response.status);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new ApiClientError("Download returned empty file", response.status);
  }

  return blob;
}

export async function getDocumentTypes(): Promise<DocumentTypeSummary[]> {
  if (USE_LOCAL_STUDIO) return localGetDocumentTypes();
  return request<DocumentTypeSummary[]>("/types");
}

export async function getDashboard(): Promise<DocumentStudioDashboard> {
  if (USE_LOCAL_STUDIO) return localGetDashboard();
  return request<DocumentStudioDashboard>("/dashboard");
}

export async function createDocument(
  documentType: string
): Promise<CreateDocumentResponse> {
  if (USE_LOCAL_STUDIO) return localCreateDocument(documentType);
  return request<CreateDocumentResponse>("/documents", {
    method: "POST",
    body: JSON.stringify({ documentType }),
  });
}

export async function saveDocumentIntake(
  documentId: string,
  answers: DocumentStudioAnswer[]
): Promise<DocumentStudioDocument> {
  if (USE_LOCAL_STUDIO) return localSaveDocumentIntake(documentId, answers);
  return request<DocumentStudioDocument>(`/documents/${documentId}/intake`, {
    method: "PATCH",
    body: JSON.stringify({ answers }),
  });
}

export async function getDocument(
  documentId: string
): Promise<DocumentStudioDocument> {
  if (USE_LOCAL_STUDIO) return localGetDocument(documentId);
  return request<DocumentStudioDocument>(`/documents/${documentId}`);
}

export async function getDocumentDraft(
  documentId: string
): Promise<DocumentStudioDocument> {
  if (USE_LOCAL_STUDIO) return localGetDocument(documentId);
  return request<DocumentStudioDocument>(`/documents/${documentId}/draft`);
}

export async function getDocumentReview(
  documentId: string
): Promise<DocumentStudioReview> {
  if (USE_LOCAL_STUDIO) return localGetDocumentReview(documentId);
  return request<DocumentStudioReview>(`/documents/${documentId}/review`);
}

export async function createCheckout(
  documentId: string
): Promise<CheckoutResponse> {
  if (USE_LOCAL_STUDIO) return localCreateCheckout(documentId);
  return request<CheckoutResponse>(`/documents/${documentId}/checkout`, {
    method: "POST",
  });
}

export async function getPaymentStatus(
  documentId: string
): Promise<CheckoutResponse> {
  if (USE_LOCAL_STUDIO) return localCreateCheckout(documentId);
  return request<CheckoutResponse>(`/documents/${documentId}/payment-status`);
}

export async function triggerGeneration(
  documentId: string
): Promise<GenerationStatusResponse> {
  if (USE_LOCAL_STUDIO) return localTriggerGeneration(documentId);
  return request<GenerationStatusResponse>(
    `/documents/${documentId}/generate`,
    { method: "POST" }
  );
}

export async function getGenerationStatus(
  documentId: string
): Promise<GenerationStatusResponse> {
  if (USE_LOCAL_STUDIO) return localGetGenerationStatus();
  return request<GenerationStatusResponse>(
    `/documents/${documentId}/generation-status`
  );
}

export async function getCompletedDocument(
  documentId: string
): Promise<CompletedDocumentResponse> {
  if (USE_LOCAL_STUDIO) return localGetCompletedDocument(documentId);
  return request<CompletedDocumentResponse>(
    `/documents/${documentId}/download`
  );
}

export async function downloadDocumentPdf(
  documentId: string
): Promise<Blob> {
  if (USE_LOCAL_STUDIO) return localDownloadDocumentPdf(documentId);
  return downloadRequest(`/documents/${documentId}/download/pdf`);
}

export async function downloadDocumentDocx(
  documentId: string
): Promise<Blob> {
  if (USE_LOCAL_STUDIO) return localDownloadDocumentDocx(documentId);
  return downloadRequest(`/documents/${documentId}/download/docx`);
}

export async function getDocumentHistory(): Promise<DocumentHistoryResponse> {
  if (USE_LOCAL_STUDIO) return localGetDocumentHistory();
  return request<DocumentHistoryResponse>("/history");
}

export async function getSettings(): Promise<DocumentStudioSettings> {
  if (USE_LOCAL_STUDIO) return localGetSettings();
  return request<DocumentStudioSettings>("/settings");
}

export async function updateSettings(
  payload: Partial<DocumentStudioSettings>
): Promise<DocumentStudioSettings> {
  if (USE_LOCAL_STUDIO) return localUpdateSettings(payload);
  return request<DocumentStudioSettings>("/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function isUnauthorizedError(_error: unknown): boolean {
  return false;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 404;
}
