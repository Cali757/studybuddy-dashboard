import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { VertexAI } from "@google-cloud/vertexai";
import { getFirestore } from "firebase-admin/firestore";

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_REGION!,
});

const model = vertexAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

export const autoSummary = onDocumentCreated(
  "lessons/{lessonId}",
  async (event) => {
    const db = getFirestore();
    const data = event.data?.data();
    if (!data?.transcript) return;

    const prompt = `
Summarize the following lesson in 5 clear bullet points:

${data.transcript}
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    await db
      .collection("lessons")
      .doc(event.params.lessonId)
      .update({ summary });
  }
);
