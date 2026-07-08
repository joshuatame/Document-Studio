import type { DocumentTypeSummary } from "@/types/document-studio";

export const LOCAL_CATALOG: DocumentTypeSummary[] = [
  {
    id: "nda",
    slug: "non-disclosure-agreement",
    title: "Non-Disclosure Agreement",
    description:
      "Protect confidential information shared between parties with a tailored NDA.",
    estimatedMinutes: 10,
    priceCents: 4900,
    currency: "AUD",
    icon: "shield",
  },
  {
    id: "employment",
    slug: "employment-agreement",
    title: "Employment Agreement",
    description:
      "Create a comprehensive employment contract covering roles, pay, and obligations.",
    estimatedMinutes: 20,
    priceCents: 9900,
    currency: "AUD",
    icon: "briefcase",
  },
  {
    id: "contractor",
    slug: "contractor-agreement",
    title: "Contractor Agreement",
    description:
      "Define scope, deliverables, and payment terms for independent contractors.",
    estimatedMinutes: 15,
    priceCents: 7900,
    currency: "AUD",
    icon: "user-check",
  },
  {
    id: "service",
    slug: "service-agreement",
    title: "Service Agreement",
    description:
      "Formalise services provided between your business and clients or partners.",
    estimatedMinutes: 15,
    priceCents: 7900,
    currency: "AUD",
    icon: "file-text",
  },
  {
    id: "privacy",
    slug: "privacy-policy",
    title: "Privacy Policy",
    description:
      "Generate a privacy policy aligned with Australian privacy requirements.",
    estimatedMinutes: 12,
    priceCents: 5900,
    currency: "AUD",
    icon: "lock",
  },
  {
    id: "terms",
    slug: "website-terms-and-conditions",
    title: "Website Terms and Conditions",
    description:
      "Set clear rules and limitations for visitors using your website.",
    estimatedMinutes: 12,
    priceCents: 5900,
    currency: "AUD",
    icon: "globe",
  },
  {
    id: "workplace",
    slug: "workplace-policy",
    title: "Workplace Policy",
    description:
      "Establish workplace standards, conduct expectations, and procedures.",
    estimatedMinutes: 18,
    priceCents: 8900,
    currency: "AUD",
    icon: "building",
  },
  {
    id: "hr-letter",
    slug: "hr-letter",
    title: "HR Letter",
    description:
      "Draft professional HR correspondence for employees and candidates.",
    estimatedMinutes: 8,
    priceCents: 3900,
    currency: "AUD",
    icon: "mail",
  },
  {
    id: "business-letter",
    slug: "business-letter",
    title: "Business Letter",
    description:
      "Compose formal business letters for clients, partners, and stakeholders.",
    estimatedMinutes: 8,
    priceCents: 2900,
    currency: "AUD",
    icon: "send",
  },
  {
    id: "procedure",
    slug: "company-procedure",
    title: "Company Procedure",
    description:
      "Document step-by-step internal procedures for your organisation.",
    estimatedMinutes: 15,
    priceCents: 6900,
    currency: "AUD",
    icon: "list-checks",
  },
];

export function getLocalDocumentType(
  slug: string
): DocumentTypeSummary | undefined {
  return LOCAL_CATALOG.find((t) => t.slug === slug);
}

export function getLocalIntakeQuestions(
  slug: string
): import("@/types/document-studio").DocumentStudioQuestion[] {
  const docType = getLocalDocumentType(slug);
  const title = docType?.title ?? "Document";

  return [
    {
      id: "company_name",
      type: "text",
      label: "Company or organisation name",
      placeholder: "e.g. Acme Pty Ltd",
      required: true,
    },
    {
      id: "contact_name",
      type: "text",
      label: "Primary contact name",
      placeholder: "Full name",
      required: true,
    },
    {
      id: "contact_email",
      type: "email",
      label: "Contact email",
      placeholder: "name@company.com",
      required: true,
    },
    {
      id: "jurisdiction",
      type: "select",
      label: "Governing jurisdiction",
      required: true,
      options: [
        { label: "New South Wales", value: "NSW" },
        { label: "Victoria", value: "VIC" },
        { label: "Queensland", value: "QLD" },
        { label: "Western Australia", value: "WA" },
        { label: "South Australia", value: "SA" },
        { label: "Tasmania", value: "TAS" },
        { label: "Australian Capital Territory", value: "ACT" },
        { label: "Northern Territory", value: "NT" },
        { label: "Australia (Federal)", value: "AU" },
      ],
    },
    {
      id: "document_purpose",
      type: "textarea",
      label: `Purpose of this ${title}`,
      description:
        "Describe the context and what you need this document to achieve.",
      placeholder: "Provide relevant background and objectives…",
      required: true,
      validation: { minLength: 20, maxLength: 2000 },
    },
    {
      id: "key_parties",
      type: "textarea",
      label: "Key parties involved",
      description: "List the parties, roles, and any relevant details.",
      placeholder: "e.g. Employer, employee, contractor…",
      required: true,
    },
    {
      id: "special_terms",
      type: "textarea",
      label: "Special terms or requirements",
      description: "Any specific clauses, conditions, or preferences.",
      placeholder: "Optional — leave blank if none",
      required: false,
    },
    {
      id: "effective_date",
      type: "date",
      label: "Preferred effective date",
      required: false,
    },
    {
      id: "acknowledgement",
      type: "checkbox",
      label:
        "I confirm the information provided is accurate and understand this document will be generated by AI based on my inputs.",
      required: true,
    },
  ];
}
