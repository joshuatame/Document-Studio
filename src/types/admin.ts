export type TemplateProductionStatus = "draft" | "production" | "deprecated";

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface AdminTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId?: string;
  category?: string;
  icon: string;
  estimatedMinutes: number;
  priceCents: number;
  currency: string;
  active: boolean;
  productionStatus: TemplateProductionStatus;
  requiresLegalReview: boolean;
  disclaimer?: string;
  sortOrder: number;
  isFree: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  promptTemplate?: string;
  promptInstructions?: string;
  questions?: import("./document-studio").DocumentStudioQuestion[];
}

export interface AdminOverview {
  templateCount: number;
  activeTemplateCount: number;
  orderCount: number;
  generationCount: number;
}

export interface TemplatePricing {
  templateId: string;
  templateTitle: string;
  priceCents: number;
  currency: string;
  isFree: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface ProviderSettings {
  provider: "openai";
  model: string;
  apiKeyConfigured: boolean;
  maskedApiKey?: string;
  lastTestStatus?: "success" | "failed" | "never";
  lastTestAt?: string;
  lastTestMessage?: string;
}

export interface StripeSettings {
  publishableKey?: string;
  configured: boolean;
  webhookSecretConfigured: boolean;
  webhookEndpointUrl: string;
}

export interface AdminOrder {
  id: string;
  documentId: string;
  userEmail?: string;
  templateTitle?: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface GenerationLog {
  id: string;
  documentId: string;
  templateSlug?: string;
  templateTitle?: string;
  status: string;
  message?: string;
  createdAt: string;
}

export interface ProviderSettingsPayload {
  provider: "openai";
  model: string;
  apiKey?: string;
}

export interface StripeSettingsPayload {
  publishableKey?: string;
}
