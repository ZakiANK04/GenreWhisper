import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { predictGenre } from "@/lib/genreInference";

export const runtime = "nodejs";

function getPythonPath() {
  return (
    process.env.GENREWHISPER_PYTHON ||
    "C:\\Users\\zzaou\\AppData\\Local\\Programs\\Python\\Python312\\python.exe"
  );
}

function estimateSentiment(text: string) {
  const lower = text.toLowerCase();
  const positive = ["excellent", "amazing", "beautiful", "great", "helpful", "insightful", "love", "powerful"];
  const negative = ["boring", "weak", "bad", "confusing", "poor", "disappointing", "hate", "awful"];

  const posCount = positive.filter((word) => lower.includes(word)).length;
  const negCount = negative.filter((word) => lower.includes(word)).length;

  if (posCount >= negCount + 2) return "Highly Positive";
  if (negCount >= posCount + 2) return "Negative";
  return "Mixed/Polarized";
}

function extractTextFromCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  return {
    extractedText: lines.slice(0, 200).join(" "),
    documentsProcessed: Math.max(lines.length - 1, 1),
  };
}

function extractTextFromJson(text: string) {
  try {
    const parsed = JSON.parse(text);
    const values: string[] = [];

    const collect = (value: unknown) => {
      if (typeof value === "string") {
        values.push(value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(collect);
        return;
      }
      if (value && typeof value === "object") {
        Object.values(value).forEach(collect);
      }
    };

    collect(parsed);
    return {
      extractedText: values.join(" ").slice(0, 20000),
      documentsProcessed: Array.isArray(parsed) ? parsed.length : 1,
    };
  } catch {
    return { extractedText: text, documentsProcessed: 1 };
  }
}

async function extractPdfText(fileBuffer: Buffer, originalName: string) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "genrewhisper-pdf-"));
  const pdfPath = path.join(tmpDir, originalName || "upload.pdf");
  await fs.writeFile(pdfPath, fileBuffer);

  try {
    const scriptPath = path.join(process.cwd(), "scripts", "extract_pdf_text.py");
    const result = spawnSync(getPythonPath(), [scriptPath, pdfPath], {
      cwd: process.cwd(),
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });

    if (result.status !== 0) {
      throw new Error(result.stderr || "Failed to extract PDF text.");
    }

    return {
      extractedText: result.stdout.trim(),
      documentsProcessed: 1,
    };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function extractText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const lowerName = file.name.toLowerCase();
  const text = buffer.toString("utf8");

  if (lowerName.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(buffer, file.name);
  }

  if (lowerName.endsWith(".csv")) {
    return extractTextFromCsv(text);
  }

  if (lowerName.endsWith(".json")) {
    return extractTextFromJson(text);
  }

  return {
    extractedText: text,
    documentsProcessed: 1,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file upload is required." }, { status: 400 });
    }

    const { extractedText, documentsProcessed } = await extractText(file);
    const normalizedText = extractedText.replace(/\s+/g, " ").trim();

    if (!normalizedText) {
      return NextResponse.json({ error: "Could not extract readable text from the uploaded file." }, { status: 400 });
    }

    const result = await predictGenre(normalizedText.slice(0, 20000));
    const sentiment = estimateSentiment(normalizedText);

    return NextResponse.json({
      title: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      genre: result.genre,
      confidence: Number(result.confidence.toFixed(1)),
      sentiment,
      reviewsAnalyzed: documentsProcessed,
      tokenCount: result.token_count,
      top3: result.top3.map((item) => ({
        genre: item.genre,
        confidence: Number(item.confidence.toFixed(1)),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
