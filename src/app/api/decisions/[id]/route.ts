import { NextResponse } from "next/server";
import { getDecision } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter 'id'" },
        { status: 400 }
      );
    }

    const decision = await getDecision(id);
    if (!decision) {
      return NextResponse.json(
        { error: `Decision with id '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to retrieve decision",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
