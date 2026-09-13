import test from "node:test";
import assert from "node:assert/strict";
import { POST as createDecision, GET as listDecisions } from "../src/app/api/decisions/route.js";
import { GET as getDecisionById } from "../src/app/api/decisions/[id]/route.js";
import { POST as verifyRoute } from "../src/app/api/verify/route.js";
import { POST as tamperRoute } from "../src/app/api/tamper/route.js";
import { clearStore } from "../src/lib/store.js";

test("API: POST /api/decisions creates and records loan decision with real CooL evidence", async () => {
  await clearStore();

  const req = new Request("http://localhost:3000/api/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      applicationId: "A-4821",
    }),
  });

  const res = await createDecision(req);
  assert.equal(res.status, 201);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.decision.caseInfo.applicationId, "A-4821");
  assert.equal(data.decision.caseInfo.model, "acme/credit-scorer");
  assert.equal(data.decision.caseInfo.version, "2026.06.0");
  assert.equal(data.decision.caseInfo.policy, "lending-policy-v4");
  assert.equal(data.decision.caseInfo.decision, "APPROVED");
  assert.equal(data.decision.caseInfo.amount, "$12,000");
  assert.ok(data.decision.recordId);
  assert.ok(data.decision.executionId);
  assert.ok(data.decision.digest);
  assert.ok(data.decision.evidence);
});

test("API: GET /api/decisions lists stored decisions", async () => {
  const req = new Request("http://localhost:3000/api/decisions", {
    method: "GET",
  });

  const res = await listDecisions();
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.count >= 1);
  assert.ok(Array.isArray(data.decisions));
});

test("API: GET /api/decisions/[id] retrieves decision by application id and 404s on missing", async () => {
  const req = new Request("http://localhost:3000/api/decisions/A-4821", {
    method: "GET",
  });

  const res = await getDecisionById(req, {
    params: Promise.resolve({ id: "A-4821" }),
  });
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.decision.id, "A-4821");

  // Non-existent ID returns 404
  const missingRes = await getDecisionById(req, {
    params: Promise.resolve({ id: "NON_EXISTENT_CASE" }),
  });
  assert.equal(missingRes.status, 404);
});

test("API: POST /api/verify verifies evidence with real CooL verifyEvidence API", async () => {
  // Test by ID lookup
  const reqById = new Request("http://localhost:3000/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "A-4821" }),
  });

  const res = await verifyRoute(reqById);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.ok, true);
  assert.equal(data.checks.binding.status, "pass");
  assert.equal(data.checks.signature.status, "pass");
  assert.equal(data.checks.attestation.status, "simulated");
  assert.ok(data.formattedVerdict.includes("RESULT      VERIFIED"));
});

test("API: POST /api/tamper mutates evidence, calls real verifyEvidence, and reports failure", async () => {
  // 1. Default tampering: metadata_hash mutation
  const req = new Request("http://localhost:3000/api/tamper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "A-4821",
      mutationType: "metadata_hash",
    }),
  });

  const res = await tamperRoute(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.mutationType, "metadata_hash");
  assert.equal(data.originalVerdict.ok, true);
  assert.equal(data.tamperedVerdict.ok, false);
  assert.equal(data.tamperedVerdict.checks.binding.status, "fail");
  assert.equal(data.tamperedVerdict.checks.signature.status, "fail");
  assert.ok(data.tamperedVerdict.reasons.length > 0);

  // 2. Signature key tampering: signature fails, binding passes
  const reqSig = new Request("http://localhost:3000/api/tamper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: "A-4821",
      mutationType: "signature_key",
    }),
  });

  const resSig = await tamperRoute(reqSig);
  assert.equal(resSig.status, 200);
  const dataSig = await resSig.json();
  assert.equal(dataSig.originalVerdict.ok, true);
  assert.equal(dataSig.tamperedVerdict.ok, false);
  assert.equal(dataSig.tamperedVerdict.checks.signature.status, "fail");
});
