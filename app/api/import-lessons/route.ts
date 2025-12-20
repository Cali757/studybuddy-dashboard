// app/api/import-lessons/route.ts
import { google } from "googleapis";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/drive.readonly"]
  );

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
    fields: "files(id, name)",
  });

  for (const file of res.data.files || []) {
    const content = await drive.files.export({
      fileId: file.id!,
      mimeType: "text/plain",
    });

    await adminDb.collection("lessons").doc(file.id!).set({
      title: file.name,
      transcript: content.data,
      createdAt: new Date(),
    });
  }

  return Response.json({ success: true });
}
