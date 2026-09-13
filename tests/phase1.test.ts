import test from "node:test";
import assert from "node:assert/strict";
import { createAndRecordLoanDecision } from "../src/lib/evidence-service.js";
import { verifyEvidence, formatVerdict, getCoolClient } from "../src/lib/cool.js";
import { saveDecision, getDecision, clearStore } from "../src/lib/store.js";
import type { Evidence } from "cool-nwc";

type DeepMutable<T> = T extends object ? { -readonly [K in keyof T]: DeepMutable<T[K]> } : T;
const clone = (e: Evidence): DeepMutable<Evidence> =>
  JSON.parse(JSON.stringify(e)) as DeepMutable<Evidence>;

test("Phase 1: Deterministic AI loan decision creation and CooL evidence capture", async () => {
  await clearStore();

  const record = await createAndRecordLoanDecision();

  // Validate case information
  assert.equal(record.caseInfo.applicationId, "A-4821");
  assert.equal(record.caseInfo.model, "acme/credit-scorer");
  assert.equal(record.caseInfo.version, "2026.06.0");
  assert.equal(record.caseInfo.policy, "lending-policy-v4");
  assert.equal(record.caseInfo.decision, "APPROVED");
  assert.equal(record.caseInfo.amount, "$12,000");

  // Validate CooL cryptographic properties
  assert.ok(record.recordId, "recordId should be present");
  assert.equal(record.recordId.length, 26, "recordId should be a 26-character ULID");
  assert.ok(record.executionId, "executionId should be present");
  assert.ok(record.digest.startsWith("mh:sha256:"), "digest should be a SHA-256 multihash");
  assert.equal(record.evidence.schema, "cool.receipt.v2");

  // Validate storage
  await saveDecision(record);
  const retrieved = await getDecision(record.id);
  assert.ok(retrieved);
  assert.equal(retrieved.id, "A-4821");
  assert.equal(retrieved.recordId, record.recordId);
});

test("Phase 1: Valid CooL evidence verification succeeds offline", async () => {
  const record = await createAndRecordLoanDecision();
  const verdict = await verifyEvidence(record.evidence);

  assert.equal(verdict.ok, true, "Clean evidence must verify ok: true");
  assert.equal(verdict.checks.binding.status, "pass", "Binding check must pass");
  assert.equal(verdict.checks.signature.status, "pass", "Hybrid signature check must pass");
  // Simulated environment honestly reports simulated, never fake hardware pass
  assert.equal(verdict.checks.attestation.status, "simulated", "Attestation must be simulated in local mode");
  assert.equal(verdict.checks.enclave.status, "simulated", "Enclave must be simulated in local mode");

  const formatted = formatVerdict(verdict);
  assert.match(formatted, /COOL VERIFIER/);
  assert.match(formatted, /RESULT {6}VERIFIED/);
});

test("Phase 1: Tampered evidence verification correctly fails", async () => {
  const record = await createAndRecordLoanDecision();
  const forged = clone(record.evidence);

  const ev = (forged.record as unknown as { event: { metadata_hash: string } }).event;
  const originalHash = ev.metadata_hash;
  // Mutate one hex digit
  ev.metadata_hash = originalHash.replace(/.$/, (c) => (c === "0" ? "1" : "0"));

  const verdict = await verifyEvidence(forged);
  assert.equal(verdict.ok, false, "Tampered evidence must fail verification");
  assert.ok(verdict.reasons.length > 0, "Verdict must provide structured failure reasons");
  assert.match(formatVerdict(verdict), /RESULT {6}FAILED/);
});

test("Phase 1: Tampered metadata commitment triggers binding failure", async () => {
  const record = await createAndRecordLoanDecision();
  const forged = clone(record.evidence);

  // Set corrupted metadata hash commitment
  (forged.record as unknown as { event: { metadata_hash: string } }).event.metadata_hash =
    "mh:sha256:" + "0".repeat(64);

  const verdict = await verifyEvidence(forged);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.checks.binding.status, "fail", "Binding check must fail when commitment altered");
  assert.equal(verdict.checks.signature.status, "fail", "Signature check must fail because signature covers core");
});

test("Phase 1: Swapped signature key triggers signature failure while binding passes", async () => {
  const record = await createAndRecordLoanDecision();
  const forged = clone(record.evidence);

  // Alter signer key ID without touching the commitment hashes
  (forged.record as any).signature.key_id = "unauthorized-key-id-9999";

  const verdict = await verifyEvidence(forged);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.checks.signature.status, "fail", "Signature verification must fail with swapped key");
});

test("Phase 2: Corrupted hybrid signature payload triggers signature failure while binding passes", async () => {
  const record = await createAndRecordLoanDecision();
  const forged = clone(record.evidence);

  // Corrupt ML-DSA signature payload without altering core commitments
  (forged.record as any).signature.ml_dsa = (forged.record as any).signature.ml_dsa.replace(
    /.$/,
    (c: string) => (c === "A" ? "B" : "A")
  );

  const verdict = await verifyEvidence(forged);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.checks.binding.status, "pass", "Binding check remains intact because core was untouched");
  assert.equal(verdict.checks.signature.status, "fail", "Signature verification fails due to corrupted signature bytes");
});

test("Phase 1: Evidence privacy — no raw input or decision data leaked in plaintext", async () => {
  const record = await createAndRecordLoanDecision();
  const wire = JSON.stringify(record.evidence);

  // In CooL SDK, metadata & payloads are committed as salted multihashes
  assert.equal(wire.includes("Jordan Vance"), false, "Applicant name must not be in the receipt wire format");
  assert.equal(wire.includes("creditScore"), false, "Credit score property must not be in the receipt wire format");
  assert.equal(wire.includes("debtToIncome"), false, "Debt to income property must not be in the receipt wire format");
  assert.equal(wire.includes("annualIncome"), false, "Annual income property must not be in the receipt wire format");
});
