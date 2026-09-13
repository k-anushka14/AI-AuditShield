import { ApplicantInput, LoanDecisionOutput, CaseInformation } from "./types";

export const DEFAULT_MODEL_CONFIG = {
  model: "acme/credit-scorer",
  version: "2026.06.0",
  policy: "lending-policy-v4",
} as const;

export const DEFAULT_APPLICANT: ApplicantInput = {
  applicationId: "A-4821",
  applicantName: "Jordan Vance",
  creditScore: 740,
  debtToIncome: 0.22,
  annualIncome: 85000,
  requestedAmount: 12000,
};

/**
 * Deterministically simulates the AI credit evaluation based on input features
 * and policy rules (lending-policy-v4).
 */
export function evaluateLoanDecision(
  inputPartial?: Partial<ApplicantInput>
): { input: ApplicantInput; output: LoanDecisionOutput; caseInfo: CaseInformation } {
  const input: ApplicantInput = {
    applicationId: inputPartial?.applicationId || DEFAULT_APPLICANT.applicationId,
    applicantName: inputPartial?.applicantName || DEFAULT_APPLICANT.applicantName,
    creditScore: inputPartial?.creditScore ?? DEFAULT_APPLICANT.creditScore,
    debtToIncome: inputPartial?.debtToIncome ?? DEFAULT_APPLICANT.debtToIncome,
    annualIncome: inputPartial?.annualIncome ?? DEFAULT_APPLICANT.annualIncome,
    requestedAmount: inputPartial?.requestedAmount ?? DEFAULT_APPLICANT.requestedAmount,
  };

  let decision: "APPROVED" | "DENIED" | "MANUAL_REVIEW";
  let numericAmount: number;
  let interestRate: string;
  let riskTier: string;
  let rationale: string;

  if (input.creditScore >= 680 && input.debtToIncome <= 0.38) {
    decision = "APPROVED";
    numericAmount = input.requestedAmount;
    interestRate = "6.5%";
    riskTier = "TIER_1_PRIME";
    rationale = "Applicant satisfies prime tier underwriting criteria under lending-policy-v4.";
  } else if (input.creditScore >= 620 && input.debtToIncome <= 0.45) {
    decision = "MANUAL_REVIEW";
    numericAmount = input.requestedAmount;
    interestRate = "9.8%";
    riskTier = "TIER_2_NEAR_PRIME";
    rationale = "Moderate risk indicators detected. Escalated for human underwriter review.";
  } else {
    decision = "DENIED";
    numericAmount = 0;
    interestRate = "N/A";
    riskTier = "TIER_3_SUBPRIME";
    rationale = "Credit score below minimum underwriting floor or debt-to-income exceeds policy threshold.";
  }

  const formattedAmount = `$${numericAmount.toLocaleString()}`;

  const output: LoanDecisionOutput = {
    decision,
    amount: formattedAmount,
    numericAmount,
    interestRate,
    riskTier,
    rationale,
    policyApplied: DEFAULT_MODEL_CONFIG.policy,
  };

  const caseInfo: CaseInformation = {
    applicationId: input.applicationId,
    model: DEFAULT_MODEL_CONFIG.model,
    version: DEFAULT_MODEL_CONFIG.version,
    policy: DEFAULT_MODEL_CONFIG.policy,
    decision,
    amount: formattedAmount,
    input,
    output,
    timestamp: new Date().toISOString(),
  };

  return { input, output, caseInfo };
}
