import { getCoolClient } from "./cool";
import { evaluateLoanDecision } from "./decision-engine";
import { ApplicantInput, DecisionRecord } from "./types";

/**
 * Executes a deterministic simulated loan decision and records execution evidence
 * using the real CooL SDK record() API.
 */
export async function createAndRecordLoanDecision(
  inputPartial?: Partial<ApplicantInput>
): Promise<DecisionRecord> {
  const { input, output, caseInfo } = evaluateLoanDecision(inputPartial);
  const cool = getCoolClient();

  // CooL records commitments over metadata and payloads without storing plaintext
  const { evidence, recordId, executionId, digest } = await cool.record({
    type: "loan.decision",
    metadata: {
      model: caseInfo.model,
      version: caseInfo.version,
      policy: caseInfo.policy,
      applicationId: caseInfo.applicationId,
      decision: caseInfo.decision,
      amount: caseInfo.amount,
      environment: "production",
    },
    payloads: {
      input: JSON.stringify(caseInfo.input),
      output: JSON.stringify(caseInfo.output),
    },
    software: {
      name: "credit-scorer",
      version: caseInfo.version,
      digest: null,
    },
  });

  // Ensure internal queue and readiness
  await cool.ready();

  const decisionRecord: DecisionRecord = {
    id: caseInfo.applicationId,
    recordId,
    executionId,
    digest,
    caseInfo,
    evidence,
    createdAt: new Date().toISOString(),
  };

  return decisionRecord;
}
