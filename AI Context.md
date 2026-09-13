# AI AuditShield — Hackathon Context

## Goal

Build AI AuditShield for the Northwind Cipher Reverse Hackathon Round 2.

The product must use the CooL SDK meaningfully.

Core idea:

"When an AI decision is disputed, reconstruct what happened
and prove that the evidence has not been altered."

## Required CooL integration

CooL is the cryptographic evidence layer.

We MUST use the real CooL SDK APIs rather than mocking
cryptographic verification.

Important verified behavior from the official CooL demo:

1. CooL records AI execution evidence.
2. Metadata and payloads are stored as salted hash commitments.
3. Evidence can be verified offline.
4. Binding verification detects modifications.
5. ML-DSA-65 + Ed25519 signatures are verified.
6. Transparency-log inclusion can be verified.
7. Local development uses simulated TDX unless a real dstack
   endpoint is configured.
8. CooL does NOT prove that an AI decision is correct, fair,
   or safe.

## Product

AI AuditShield is an AI incident investigation platform.

Primary workflow:

AI Decision
    ↓
CooL Evidence Capture
    ↓
Cryptographic Receipt
    ↓
Verification
    ↓
Investigation
    ↓
Tamper Detection

## Main demo

Scenario: disputed loan decision.

Example:

Application: A-4821
Model: acme/credit-scorer
Version: 2026.06.0
Policy: lending-policy-v4
Decision: APPROVED
Amount: $12,000

The system should:

1. Execute a simulated AI decision.
2. Record evidence through CooL.
3. Display the evidence receipt.
4. Verify it using the real CooL verifier.
5. Allow the user to tamper with the evidence.
6. Verify the modified evidence.
7. Show actual verification failure.
8. Explain what failed.

## Important honesty rules

DO NOT claim:

- CooL proves AI correctness.
- CooL proves fairness.
- CooL proves safety.
- Local simulated TDX is hardware attestation.
- The product is legally compliant.
- The evidence is "court-ready".

Use accurate terminology:

- cryptographically verifiable
- tamper-evident
- independently verifiable
- simulated attestation
- evidence of execution

## UI priorities

The product should feel like an enterprise security/investigation
platform rather than a generic SaaS dashboard.

Prioritize:

1. Decision investigation
2. Verification Center
3. Tamper Lab
4. Evidence timeline
5. Evidence receipt
6. Clear CooL integration

## Hackathon constraints

- Must be open source.
- Must have a GitHub repository.
- Must deploy successfully.
- Must provide a Vercel URL.
- README must explain architecture, CooL integration,
  technical decisions, setup, limitations and future work.
- CooL must be meaningful to the product.

## Engineering principle

Prefer a small, reliable, polished implementation over many
unfinished features.

Never replace real CooL functionality with fake UI.