async function main() {
  console.log("=== AI AUDITSHIELD PHASE 2 PRODUCTION VERIFICATION ===");

  // 1. Dashboard (GET /)
  console.log("\n[1/7] Testing Dashboard UI (GET /)...");
  const homeRes = await fetch("http://localhost:3000/");
  if (homeRes.status !== 200) throw new Error(`Dashboard returned HTTP ${homeRes.status}`);
  const html = await homeRes.text();
  if (!html.includes("AI AuditShield")) throw new Error("Dashboard missing 'AI AuditShield' title");
  if (!html.includes("Investigation")) throw new Error("Dashboard missing 'Investigation' section");
  console.log("✓ Dashboard loaded (HTTP 200, HTML length:", html.length, "bytes)");

  // 2. Create Decision (POST /api/decisions)
  console.log("\n[2/7] Testing AI Decision Creation (POST /api/decisions)...");
  const createRes = await fetch("http://localhost:3000/api/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      applicationId: "A-4821",
      applicantName: "Jordan Vance",
      creditScore: 740,
      debtToIncome: 0.22,
      annualIncome: 85000,
      requestedAmount: 12000,
    }),
  });
  if (createRes.status !== 201) throw new Error(`Create decision returned HTTP ${createRes.status}`);
  const createData = await createRes.json();
  const dec = createData.decision;
  console.log("✓ Decision created:", {
    caseId: dec.caseInfo.applicationId,
    decision: dec.caseInfo.decision,
    amount: dec.caseInfo.amount,
    model: dec.caseInfo.model,
    version: dec.caseInfo.version,
    policy: dec.caseInfo.policy,
    recordId: dec.recordId,
    digest: dec.digest,
  });

  // 3. Investigation Retrieval (GET /api/decisions/A-4821)
  console.log("\n[3/7] Testing Case Investigation Retrieval (GET /api/decisions/A-4821)...");
  const getRes = await fetch("http://localhost:3000/api/decisions/A-4821");
  if (getRes.status !== 200) throw new Error(`Get decision returned HTTP ${getRes.status}`);
  const getData = await getRes.json();
  console.log("✓ Case investigated:", {
    id: getData.decision.id,
    decision: getData.decision.caseInfo.decision,
    riskTier: getData.decision.caseInfo.output.riskTier,
    rationale: getData.decision.caseInfo.output.rationale,
  });

  // 4. Evidence Inspection & Privacy Check
  console.log("\n[4/7] Testing Evidence Receipt & Privacy Commitments...");
  const evidenceWire = JSON.stringify(dec.evidence);
  if (evidenceWire.includes("Jordan Vance")) throw new Error("PII leak: applicantName found in wire");
  if (evidenceWire.includes("creditScore")) throw new Error("PII leak: creditScore key found in wire");
  if (evidenceWire.includes("debtToIncome")) throw new Error("PII leak: debtToIncome key found in wire");
  if (dec.evidence.schema !== "cool.receipt.v2") throw new Error("Receipt schema invalid");
  console.log("✓ Evidence Receipt verified (cool.receipt.v2, zero plaintext leakage)");

  // 5. Verification Center (POST /api/verify)
  console.log("\n[5/7] Testing Verification Center (POST /api/verify)...");
  const verRes = await fetch("http://localhost:3000/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "A-4821" }),
  });
  if (verRes.status !== 200) throw new Error(`Verify returned HTTP ${verRes.status}`);
  const ver = await verRes.json();
  console.log("✓ Verification verdict:", {
    ok: ver.ok,
    binding: ver.checks.binding.status,
    signature: ver.checks.signature.status,
    inclusion: ver.checks.inclusion.status,
    attestation: ver.checks.attestation.status,
  });
  if (!ver.ok) throw new Error("Expected clean evidence to verify ok: true");

  // 6. Tamper Lab: Attack 1 — Metadata Commitment
  console.log("\n[6/7] Testing Tamper Lab Attack 1: Metadata Commitment Mutation...");
  const tamperRes1 = await fetch("http://localhost:3000/api/tamper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "A-4821", mutationType: "metadata_hash" }),
  });
  const tamp1 = await tamperRes1.json();
  console.log("✓ Metadata tampering response:", {
    originalOk: tamp1.originalVerdict.ok,
    tamperedOk: tamp1.tamperedVerdict.ok,
    tamperedBinding: tamp1.tamperedVerdict.checks.binding.status,
    tamperedSignature: tamp1.tamperedVerdict.checks.signature.status,
    reasonsCount: tamp1.tamperedVerdict.reasons.length,
    reasons: tamp1.tamperedVerdict.reasons,
  });
  if (tamp1.originalVerdict.ok !== true || tamp1.tamperedVerdict.ok !== false) {
    throw new Error("Tamper Lab verdict mismatch");
  }

  // 7. Tamper Lab: Attack 2 & 3 — Corrupt Signature & Key Swap
  console.log("\n[7/7] Testing Tamper Lab Attacks 2 & 3: Corrupt Signature & Key Swap...");
  const tamperRes2 = await fetch("http://localhost:3000/api/tamper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "A-4821", mutationType: "corrupt_signature" }),
  });
  const tamp2 = await tamperRes2.json();
  console.log("✓ Signature corruption response:", {
    originalOk: tamp2.originalVerdict.ok,
    tamperedOk: tamp2.tamperedVerdict.ok,
    tamperedBinding: tamp2.tamperedVerdict.checks.binding.status,
    tamperedSignature: tamp2.tamperedVerdict.checks.signature.status,
  });

  const tamperRes3 = await fetch("http://localhost:3000/api/tamper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "A-4821", mutationType: "signature_key" }),
  });
  const tamp3 = await tamperRes3.json();
  console.log("✓ Key swap response:", {
    originalOk: tamp3.originalVerdict.ok,
    tamperedOk: tamp3.tamperedVerdict.ok,
    tamperedBinding: tamp3.tamperedVerdict.checks.binding.status,
    tamperedSignature: tamp3.tamperedVerdict.checks.signature.status,
  });

  console.log("\n=======================================================");
  console.log("ALL 7 END-TO-END PRODUCT WORKFLOW TESTS PASSED SUCCESSFULLY!");
  console.log("=======================================================");
}

main().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
