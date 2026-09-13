import { NextResponse } from "next/server";
import { createAndRecordLoanDecision } from "@/lib/evidence-service";
import { saveDecision, getAllDecisions } from "@/lib/store";

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

    // Generate simulated decision & capture real CooL evidence
    const decisionRecord = await createAndRecordLoanDecision(body);

    // Persist to store
    await saveDecision(decisionRecord);

    return NextResponse.json(
      {
        success: true,
        message: "AI loan decision executed and evidence recorded via CooL SDK",
        decision: decisionRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating decision:", error);
    return NextResponse.json(
      {
        error: "Failed to create and record decision",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let decisions = await getAllDecisions();
    if (decisions.length === 0) {
      const defaultRecord = await createAndRecordLoanDecision();
      await saveDecision(defaultRecord);
      decisions = [defaultRecord];
    }
    return NextResponse.json({
      success: true,
      count: decisions.length,
      decisions,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch decisions",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
