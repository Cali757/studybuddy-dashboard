import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebaseAdmin';

// Initialize Firebase Admin
initAdmin();

const vertexAI = new VertexAI({
  project: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  location: 'us-central1',
});

const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

export async function POST(req: Request) {
  try {
    const { content, lessonId } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const prompt = `
Summarize the following lesson in 5 clear bullet points. Make it concise and educational:

${content}

Format your response as a bulleted list.
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // Save summary to Firestore if lessonId provided
    if (lessonId) {
      const db = getFirestore();
      await db.collection('lessons').doc(lessonId).update({ 
        summary,
        summaryGeneratedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
