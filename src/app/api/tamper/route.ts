import { NextResponse } from "next/server";
import { verifyEvidence, formatVerdict } from "@/lib/cool";
import { getDecision, saveDecision } from "@/lib/store";
import { createAndRecordLoanDecision } from "@/lib/evidence-service";

export async function POST(request: Request) {
  try {
    let body: any = {};
    const text = await request.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }
    }

    let evidence = body.evidence;
    let decisionRecord = null;

    if (!evidence && body.id) {
      decisionRecord = await getDecision(body.id);
      if (decisionRecord) {
        evidence = decisionRecord.evidence;
      }
    }

    // If still no evidence, auto-generate real deterministic decision evidence
    if (!evidence) {
      decisionRecord = await createAndRecordLoanDecision();
      await saveDecision(decisionRecord);
      evidence = decisionRecord.evidence;
    }

    // Deep clone the evidence
    const forged = JSON.parse(JSON.stringify(evidence));

    const mutationType = body.mutationType || "metadata_hash";
    let targetField = "";
    let originalValue: any = null;
    let tamperedValue: any = null;
    let mutationDescription = "";

    switch (mutationType) {
      case "corrupt_signature": {
        targetField = "record.signature.ml_dsa";
        const sig = forged.record?.signature;
        if (sig && sig.ml_dsa) {
          originalValue = sig.ml_dsa;
          sig.ml_dsa = sig.ml_dsa.replace(/.$/, (c: string) => (c === "A" ? "B" : "A"));
          tamperedValue = sig.ml_dsa;
        }
        mutationDescription =
          "Corrupted ML-DSA-65 post-quantum lattice signature payload. Fails signature domain while binding remains mathematically intact.";
        break;
      }

      case "signature_key": {
        targetField = "record.signature.key_id";
        originalValue = forged.record?.signature?.key_id;
        forged.record.signature.key_id = "attacker-key-forged-id";
        tamperedValue = forged.record.signature.key_id;
        mutationDescription =
          "Swapped signer key identity to 'attacker-key-forged-id'. Fails signature domain while binding remains mathematically intact.";
        break;
      }

      case "audit_path": {
        targetField = "inclusion.audit_path";
        originalValue = forged.inclusion?.audit_path;
        if (forged.inclusion) {
          forged.inclusion.audit_path = [];
        }
        tamperedValue = forged.inclusion?.audit_path ?? [];
        mutationDescription =
          "Truncated Merkle inclusion audit path to empty array. Fails RFC 6962 transparency log inclusion.";
        break;
      }

      case "payloads_hash": {
        targetField = "record.event.payloads_hash";
        const ev = forged.record?.event;
        if (ev && ev.payloads_hash) {
          originalValue = ev.payloads_hash;
          ev.payloads_hash = ev.payloads_hash.replace(/.$/, (c: string) =>
            c === "0" ? "1" : "0"
          );
          tamperedValue = ev.payloads_hash;
        }
        mutationDescription =
          "Flipped character in payloads_hash commitment. Fails binding and signature.";
        break;
      }

      case "metadata_hash":
      default: {
        targetField = "record.event.metadata_hash";
        const ev = forged.record?.event;
        if (ev && ev.metadata_hash) {
          originalValue = ev.metadata_hash;
          ev.metadata_hash = ev.metadata_hash.replace(/.$/, (c: string) =>
            c === "0" ? "1" : "0"
          );
          tamperedValue = ev.metadata_hash;
        } else {
          // Fallback if structure differs
          originalValue = forged.digest;
          forged.digest = forged.digest.replace(/.$/, (c: string) =>
            c === "0" ? "1" : "0"
          );
          tamperedValue = forged.digest;
        }
        mutationDescription =
          "Flipped last character of metadata_hash commitment. Violates cryptographic binding and invalidates the hybrid signature.";
        break;
      }
    }

    // Call the REAL verifyEvidence on original and tampered evidence
    const originalVerdict = await verifyEvidence(evidence);
    const tamperedVerdict = await verifyEvidence(forged);

    return NextResponse.json({
      success: true,
      mutationType,
      mutationDetails: {
        targetField,
        originalValue,
        tamperedValue,
        description: mutationDescription,
      },
      originalVerdict: {
        ok: originalVerdict.ok,
        checks: originalVerdict.checks,
        reasons: originalVerdict.reasons,
        formatted: formatVerdict(originalVerdict),
        verdict: originalVerdict,
      },
      tamperedVerdict: {
        ok: tamperedVerdict.ok,
        checks: tamperedVerdict.checks,
        reasons: tamperedVerdict.reasons,
        formatted: formatVerdict(tamperedVerdict),
        verdict: tamperedVerdict,
      },
      tamperedEvidence: forged,
    });
  } catch (error: any) {
    console.error("Tampering simulation error:", error);
    return NextResponse.json(
      {
        error: "Tampering execution failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
