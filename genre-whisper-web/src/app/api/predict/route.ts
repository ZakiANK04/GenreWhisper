import { NextRequest, NextResponse } from "next/server";
import { predictGenre } from "@/lib/genreInference";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const review = String(body.review ?? "").trim();

    if (!review) {
      return NextResponse.json({ error: "Review text is required." }, { status: 400 });
    }

    const result = await predictGenre(review);
    const explanation =
      result.clean_tokens.length > 0
        ? `The model leaned toward ${result.genre} because the strongest surviving review signals included: ${result.clean_tokens.join(", ")}.`
        : `The model predicted ${result.genre} from the overall semantic pattern of the review.`;

    return NextResponse.json({
      genre: result.genre,
      conf: Number(result.confidence.toFixed(1)),
      explanation,
      top3: result.top3.map((item) => ({
        g: item.genre,
        c: Number(item.confidence.toFixed(1)),
      })),
      tokenCount: result.token_count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prediction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
