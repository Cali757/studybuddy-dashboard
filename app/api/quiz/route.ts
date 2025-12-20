import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_REGION || 'us-central1',
});

const model = vertexAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export async function POST(req: Request) {
  try {
    const { transcript, content, lessonId } = await req.json();
    const lessonContent = transcript || content;

    if (!lessonContent) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const prompt = `
Create 5 multiple choice questions from this lesson.
For each question, provide:
- The question text
- 4 answer options (A, B, C, D)
- The correct answer letter
- A brief explanation

Format as JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": {
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation"
  }
]

Lesson content:
${lessonContent}
`;

    const result = await model.generateContent(prompt);
    const quizText = result.response.text();
    
    // Try to parse as JSON, fallback to raw text
    let quiz;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = quizText.match(/```json\n([\s\S]*?)\n```/) || quizText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : quizText;
      quiz = JSON.parse(jsonText);
    } catch {
      quiz = quizText;
    }

    return NextResponse.json({ quiz, lessonId });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
