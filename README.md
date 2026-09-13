# AI AuditShield

## Problem

When an AI decision is disputed, organizations need to reconstruct what happened and determine whether the evidence was altered.

## Solution

AI AuditShield is an AI incident investigation and evidence verification platform. It simulates a loan decision, records execution evidence, exposes a cryptographic receipt, verifies that receipt, and demonstrates detection of a mutation in Tamper Lab.

## How CooL is used

AI AuditShield uses the local `cool-nwc` package from `./cool-sdk` and its `CooL` SDK API:

- CooL records AI execution evidence with `CooL.record()`.
- Sensitive input and output values are represented by salted commitments rather than stored as plaintext in the receipt.
- The receipt is signed with the CooL hybrid ML-DSA-65 and Ed25519 signature scheme.
- The receipt can be independently checked with the real `verifyEvidence()` API and formatted with `formatVerdict()`.
- Tamper Lab deep-clones a receipt, mutates one selected field, and runs the real verifier against the original and mutated copies.

CooL is essential because it supplies the cryptographic evidence and verifier. AuditShield provides the investigation workflow and presentation; it does not replace CooL with a simulated pass/fail screen.

## Architecture

```text
AI Decision
    ↓
AI AuditShield
    ↓
CooL SDK
    ↓
Cryptographic Evidence
    ↓
Verification
    ↓
Investigation / Tamper Detection
```

## Features

- Deterministic AI loan decision simulation
- Investigation timeline
- Cryptographic evidence receipt
- Verification Center backed by the CooL verifier
- Tamper Lab with metadata, signature, and signer-key mutations
- Guided clean → verify → tamper demonstration

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm test
npm run build
npm run dev
```

Open the local URL printed by Next.js, normally `http://localhost:3000`.

`npm run build` first builds the local CooL SDK under `cool-sdk/dist/`, then builds the Next.js application.

## Demo flow

1. Open the seeded case `A-4821` from the dashboard.
2. Review the simulated approved loan decision and investigation timeline.
3. Open Evidence Receipt to inspect salted SHA-256 commitments, hybrid signatures, simulated runtime status, and transparency-log fields.
4. Run clean verification in Verification Center. The result is returned by the real CooL verifier.
5. Open Tamper Lab and select metadata commitment, signature corruption, or signer-key mutation.
6. Run the attack. Tamper Lab preserves the clean evidence, mutates a copy, and displays the real CooL failure result and reasons.

## Security / privacy model

The application holds the simulated decision data needed for the investigation screen, including the applicant profile and decision rationale. CooL evidence receipts do not store those input and output values as plaintext; they store salted cryptographic commitments and the fields required for verification.

SHA-256 is used for salted commitments and hashes. ML-DSA-65 is the post-quantum signature component. Ed25519 is the classical signature component. The hybrid signature does not make the whole system quantum-safe.

CooL verifies evidence integrity and related receipt domains. It does not prove that an AI decision is correct, fair, or safe.

## Limitations

- Local TDX is simulated and is not hardware attestation.
- Demo storage is in-memory with a local JSON fallback. On serverless deployment, storage is ephemeral and instance-local.
- This prototype does not provide durable case management or a production database.
- CooL does not prove AI correctness, fairness, or safety.
- This prototype is not a production compliance system and does not claim legal or court-ready status.

## Deployment

For a Vercel deployment:

1. Import the repository into Vercel.
2. Use the Next.js framework preset.
3. Use `npm run build` as the build command.
4. Deploy without requiring a database for the seeded demo.

The local CooL SDK is built by the `prebuild` script. Because the demo store uses memory and temporary/local JSON storage, records are not durable across serverless instances or restarts. Treat the deployment as a hackathon prototype.

## CooL integration

The application uses the workspace package `cool-nwc` from `./cool-sdk` and imports:

- `CooL` to record loan decision evidence
- `verifyEvidence` to verify clean and mutated receipts
- `formatVerdict` to display the verifier output
- the CooL `Evidence` type for receipt data

The integration lives primarily in `src/lib/cool.ts`, `src/lib/evidence-service.ts`, `src/app/api/verify/route.ts`, and `src/app/api/tamper/route.ts`.
