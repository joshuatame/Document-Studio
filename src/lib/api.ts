import {
  getAccessToken,
  logoutAndRedirect,
  setAuthSession,
  type AuthUser,
} from "@/lib/auth";
import type {
  AdminOrder,
  AdminOverview,
  AdminTemplate,
  GenerationLog,
  ProviderSettings,
  ProviderSettingsPayload,
  StripeSettings,
  StripeSettingsPayload,
  TemplateCategory,
  TemplatePricing,
} from "@/types/admin";
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

const DEFAULT_API_BASE = "https://api.tame-dynamics.com/api/v1";

const NON_JSON_ERROR =
  "The API returned HTML instead of JSON. Check API configuration.";

function resolveApiBase(): string {
  const raw = import.meta.env.VITE_TAME_API_URL;

  if (!raw || raw === "undefined") {
    if (import.meta.env.DEV) {
      console.warn(
        "[Document Studio] VITE_TAME_API_URL is not set. Using default:",
        DEFAULT_API_BASE
      );
    }
    return DEFAULT_API_BASE.replace(/\/$/, "");
  }

  return raw.replace(/\/$/, "");
}

export const API_BASE = resolveApiBase();
const APP_SLUG = import.meta.env.VITE_APP_SLUG || "document-studio";
const NAMESPACE = `${API_BASE}/document-studio`;
const AUTH_NAMESPACE = `${API_BASE}/auth`;

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

interface AuthTokensResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    access_token?: string;
    refresh_token?: string;
    user?: AuthUser;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
  appSlug?: string;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  appSlug?: string;
}

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return (
    contentType.includes("application/json") ||
    contentType.includes("+json")
  );
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!isJsonResponse(response)) {
    throw new ApiClientError(NON_JSON_ERROR, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiClientError(NON_JSON_ERROR, response.status);
  }
}

async function parseErrorBody(
  response: Response
): Promise<{ message: string; code?: string }> {
  if (!isJsonResponse(response)) {
    return { message: NON_JSON_ERROR };
  }

  try {
    const data = (await response.json()) as {
      message?: string;
      error?: string;
      code?: string;
      errorCode?: string;
    };
    return {
      message:
        data.message || data.error || `Request failed (${response.status})`,
      code: data.code || data.errorCode,
    };
  } catch {
    return { message: NON_JSON_ERROR };
  }
}

function handleSessionExpired(status: number, code?: string): boolean {
  if (status === 401 && code === "SESSION_EXPIRED") {
    logoutAndRedirect();
    return true;
  }
  return false;
}

function buildHeaders(
  includeJson = true,
  includeAuth = true
): HeadersInit {
  const headers: Record<string, string> = {
    "X-Tame-App-Slug": APP_SLUG,
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (includeAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

function normalizeAuthResponse(data: AuthTokensResponse): {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser | null;
} {
  const nested = data.data ?? data;
  const accessToken =
    nested.accessToken ||
    nested.token ||
    nested.access_token ||
    data.accessToken ||
    data.token ||
    data.access_token;

  if (!accessToken) {
    throw new ApiClientError("No access token returned from server", 500);
  }

  return {
    accessToken,
    refreshToken:
      nested.refreshToken ||
      nested.refresh_token ||
      data.refreshToken ||
      data.refresh_token,
    user: nested.user ?? data.user ?? null,
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<T> {
  const response = await fetch(`${NAMESPACE}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(options.body !== undefined, includeAuth),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const { message, code } = await parseErrorBody(response);
    if (includeAuth && handleSessionExpired(response.status, code)) {
      throw new ApiClientError(message, response.status, code);
    }
    throw new ApiClientError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return parseJsonResponse<T>(response);
}

async function downloadRequest(path: string): Promise<Blob> {
  const response = await fetch(`${NAMESPACE}${path}`, {
    headers: buildHeaders(false, true),
  });

  if (!response.ok) {
    const { message, code } = await parseErrorBody(response);
    if (handleSessionExpired(response.status, code)) {
      throw new ApiClientError(message, response.status, code);
    }
    throw new ApiClientError(message, response.status, code);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new ApiClientError("Download returned empty file", response.status);
  }

  return blob;
}

async function authRequest(
  path: string,
  payload: Record<string, unknown>
): Promise<AuthTokensResponse> {
  const response = await fetch(`${AUTH_NAMESPACE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tame-App-Slug": APP_SLUG,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const { message, code } = await parseErrorBody(response);
    throw new ApiClientError(message, response.status, code);
  }

  return parseJsonResponse<AuthTokensResponse>(response);
}

export async function login(
  payload: LoginPayload
): Promise<{ accessToken: string; refreshToken?: string; user?: AuthUser | null }> {
  const data = await authRequest("/login", {
    email: payload.email,
    password: payload.password,
    appSlug: payload.appSlug ?? APP_SLUG,
  });
  const session = normalizeAuthResponse(data);
  setAuthSession(session);
  return session;
}

export async function register(
  payload: RegisterPayload
): Promise<{ accessToken: string; refreshToken?: string; user?: AuthUser | null }> {
  const data = await authRequest("/register", {
    displayName: payload.displayName,
    email: payload.email,
    password: payload.password,
    appSlug: payload.appSlug ?? APP_SLUG,
  });
  const session = normalizeAuthResponse(data);
  setAuthSession(session);
  return session;
}

export async function getDocumentTypes(): Promise<DocumentTypeSummary[]> {
  // Types may be public; still attach auth if present.
  return request<DocumentTypeSummary[]>("/types", {}, true);
}

export async function getDashboard(): Promise<DocumentStudioDashboard> {
  return request<DocumentStudioDashboard>("/dashboard");
}

export async function createDocument(
  documentType: string
): Promise<CreateDocumentResponse> {
  return request<CreateDocumentResponse>("/documents", {
    method: "POST",
    body: JSON.stringify({ documentType }),
  });
}

export async function saveDocumentIntake(
  documentId: string,
  answers: DocumentStudioAnswer[]
): Promise<DocumentStudioDocument> {
  return request<DocumentStudioDocument>(`/documents/${documentId}/intake`, {
    method: "PATCH",
    body: JSON.stringify({ answers }),
  });
}

export async function getDocument(
  documentId: string
): Promise<DocumentStudioDocument> {
  return request<DocumentStudioDocument>(`/documents/${documentId}`);
}

export async function getDocumentDraft(
  documentId: string
): Promise<DocumentStudioDocument> {
  return request<DocumentStudioDocument>(`/documents/${documentId}/draft`);
}

export async function getDocumentReview(
  documentId: string
): Promise<DocumentStudioReview> {
  return request<DocumentStudioReview>(`/documents/${documentId}/review`);
}

export async function createCheckout(
  documentId: string
): Promise<CheckoutResponse> {
  return request<CheckoutResponse>(`/documents/${documentId}/checkout`, {
    method: "POST",
  });
}

export async function getPaymentStatus(
  documentId: string
): Promise<CheckoutResponse> {
  return request<CheckoutResponse>(`/documents/${documentId}/payment-status`);
}

export async function triggerGeneration(
  documentId: string
): Promise<GenerationStatusResponse> {
  return request<GenerationStatusResponse>(
    `/documents/${documentId}/generate`,
    { method: "POST" }
  );
}

export async function getGenerationStatus(
  documentId: string
): Promise<GenerationStatusResponse> {
  return request<GenerationStatusResponse>(
    `/documents/${documentId}/generation-status`
  );
}

export async function getCompletedDocument(
  documentId: string
): Promise<CompletedDocumentResponse> {
  return request<CompletedDocumentResponse>(
    `/documents/${documentId}/download`
  );
}

export async function downloadDocumentPdf(
  documentId: string
): Promise<Blob> {
  return downloadRequest(`/documents/${documentId}/download/pdf`);
}

export async function downloadDocumentDocx(
  documentId: string
): Promise<Blob> {
  return downloadRequest(`/documents/${documentId}/download/docx`);
}

export async function getDocumentHistory(): Promise<DocumentHistoryResponse> {
  return request<DocumentHistoryResponse>("/history");
}

export async function getSettings(): Promise<DocumentStudioSettings> {
  return request<DocumentStudioSettings>("/settings");
}

export async function updateSettings(
  payload: Partial<DocumentStudioSettings>
): Promise<DocumentStudioSettings> {
  return request<DocumentStudioSettings>("/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 401;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 404;
}

export function isSessionExpiredError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    error.status === 401 &&
    error.code === "SESSION_EXPIRED"
  );
}

// ─── Admin API ───────────────────────────────────────────────────────────────

export async function getAdminOverview(): Promise<AdminOverview> {
  return request<AdminOverview>("/admin/overview");
}

export async function getAdminTemplates(): Promise<AdminTemplate[]> {
  return request<AdminTemplate[]>("/admin/templates");
}

export async function getAdminTemplate(id: string): Promise<AdminTemplate> {
  return request<AdminTemplate>(`/admin/templates/${id}`);
}

export async function createAdminTemplate(
  payload: Partial<AdminTemplate>
): Promise<AdminTemplate> {
  return request<AdminTemplate>("/admin/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminTemplate(
  id: string,
  payload: Partial<AdminTemplate>
): Promise<AdminTemplate> {
  return request<AdminTemplate>(`/admin/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminCategories(): Promise<TemplateCategory[]> {
  return request<TemplateCategory[]>("/admin/categories");
}

export async function createAdminCategory(
  payload: Partial<TemplateCategory>
): Promise<TemplateCategory> {
  return request<TemplateCategory>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCategory(
  id: string,
  payload: Partial<TemplateCategory>
): Promise<TemplateCategory> {
  return request<TemplateCategory>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminPricing(): Promise<TemplatePricing[]> {
  return request<TemplatePricing[]>("/admin/pricing");
}

export async function updateAdminPricing(
  templateId: string,
  payload: Partial<TemplatePricing>
): Promise<TemplatePricing> {
  return request<TemplatePricing>(`/admin/pricing/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getProviderSettings(): Promise<ProviderSettings> {
  return request<ProviderSettings>("/admin/provider-settings");
}

export async function updateProviderSettings(
  payload: ProviderSettingsPayload
): Promise<ProviderSettings> {
  return request<ProviderSettings>("/admin/provider-settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function testProviderConnection(): Promise<ProviderSettings> {
  return request<ProviderSettings>("/admin/provider-settings/test", {
    method: "POST",
  });
}

export async function getStripeSettings(): Promise<StripeSettings> {
  return request<StripeSettings>("/admin/stripe");
}

export async function updateStripeSettings(
  payload: StripeSettingsPayload
): Promise<StripeSettings> {
  return request<StripeSettings>("/admin/stripe", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return request<AdminOrder[]>("/admin/orders");
}

export async function getGenerationLogs(): Promise<GenerationLog[]> {
  return request<GenerationLog[]>("/admin/generation-logs");
}
