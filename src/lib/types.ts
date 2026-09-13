import type { Evidence } from "cool-nwc";

export interface ApplicantInput {
  applicationId: string;
  applicantName?: string;
  creditScore: number;
  debtToIncome: number;
  annualIncome: number;
  requestedAmount: number;
}

export interface LoanDecisionOutput {
  decision: "APPROVED" | "DENIED" | "MANUAL_REVIEW";
  amount: string;
  numericAmount: number;
  interestRate: string;
  riskTier: string;
  rationale: string;
  policyApplied: string;
}

export interface CaseInformation {
  applicationId: string;
  model: string;
  version: string;
  policy: string;
  decision: "APPROVED" | "DENIED" | "MANUAL_REVIEW";
  amount: string;
  input: ApplicantInput;
  output: LoanDecisionOutput;
  timestamp: string;
}

export interface DecisionRecord {
  id: string;
  recordId: string;
  executionId: string;
  digest: string;
  caseInfo: CaseInformation;
  evidence: Evidence;
  createdAt: string;
}

export type VerificationStatus = "pass" | "fail" | "simulated" | "absent" | "mock";

export interface VerificationCheck {
  status: VerificationStatus;
  detail?: string;
}

export interface VerificationResponse {
  success: boolean;
  ok: boolean;
  subject?: string;
  checks: Record<string, VerificationCheck>;
  reasons: string[];
  formattedVerdict: string;
  verdict: unknown;
}

export interface TamperRequest {
  id?: string;
  evidence?: any;
  mutationType?: "metadata_hash" | "signature_key" | "corrupt_signature" | "payloads_hash" | "audit_path";
}

export interface TamperResponse {
  success: boolean;
  mutationType: string;
  mutationDetails: {
    targetField: string;
    originalValue: string | null;
    tamperedValue: string | null;
    description: string;
  };
  originalVerdict: VerificationResponse;
  tamperedVerdict: VerificationResponse;
  tamperedEvidence: Evidence;
}
