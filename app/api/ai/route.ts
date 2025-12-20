import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_REGION!,
});

const model = vertexAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

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
    const body = await req.json();
    const message = body.message || body.question || "";
    const transcript = body.transcript || body.context || "";

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

    return NextResponse.json({ response, answer: response });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json(
      { error: "Vertex AI request failed" },
      { status: 500 }
    );
  }
}
