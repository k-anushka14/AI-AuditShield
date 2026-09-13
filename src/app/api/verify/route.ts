import { NextResponse } from "next/server";
import { verifyEvidence, formatVerdict } from "@/lib/cool";
import { getDecision } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON or missing body" },
        { status: 400 }
      );
    }

    let evidence = body.evidence;
    const options = body.options || {};

    if (!evidence && body.id) {
      const stored = await getDecision(body.id);
      if (!stored) {
        return NextResponse.json(
          { error: `No decision found with id '${body.id}'` },
          { status: 404 }
        );
      }
      evidence = stored.evidence;
    }

    if (!evidence) {
      return NextResponse.json(
        { error: "Must provide either 'evidence' object or valid 'id'" },
        { status: 400 }
      );
    }

    // Call the REAL CooL verifyEvidence API
    const verdict = await verifyEvidence(evidence, options);

    return NextResponse.json({
      success: true,
      ok: verdict.ok,
      subject: verdict.subject,
      checks: verdict.checks,
      reasons: verdict.reasons,
      formattedVerdict: formatVerdict(verdict),
      verdict,
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        error: "Verification failed to run",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
