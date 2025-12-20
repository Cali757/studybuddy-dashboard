import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import { gateAICall, recordAICall } from "@/lib/aiGate";
import { auth } from "@/lib/firebaseAdmin";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check if user can make AI call based on their tier
    const gateResult = await gateAICall(uid);
    if (!gateResult.allowed) {
      return NextResponse.json(
        { 
          error: gateResult.reason,
          upgradeRequired: gateResult.upgradeRequired,
          currentUsage: gateResult.currentUsage,
          limit: gateResult.limit
        },
        { status: 403 }
      );
    }

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

    // Record the AI call for usage tracking
    await recordAICall(uid);

    return NextResponse.json({ response });
  } catch (err) {
    console.error("AI error:", err);
    return NextResponse.json(
      { error: "Vertex AI request failed" },
      { status: 500 }
    );
  }
}
