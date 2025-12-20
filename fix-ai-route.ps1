$content = @'
import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

const SYSTEM_PROMPT = `
You are StudyBuddy, a friendly AI tutor.

Rules:
- Explain concepts simply
- Encourage the student
- Use bullet points
- Suggest next steps
- Never overwhelm

Always end responses with:
"Want to keep going?"
`;

export async function POST(req: Request) {
  try {
    // Initialize VertexAI at runtime, not during build
    const vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID!,
      location: process.env.GCP_REGION!,
    });

    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const body = await req.json();
    const message = body.message || "";
    const transcript = body.transcript || "";

    const prompt = `
SYSTEM:
${SYSTEM_PROMPT}

LESSON TRANSCRIPT:
${transcript}

STUDENT MESSAGE:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json(
      { error: "Vertex AI request failed" },
      { status: 500 }
    );
  }
}
'@

$content | Out-File -FilePath "app\api\ai\route.ts" -Encoding utf8 -NoNewline
Write-Host "File updated successfully!"
