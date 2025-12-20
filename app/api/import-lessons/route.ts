import { NextResponse } from "next/server"
import { google } from "googleapis"
import { getAdminDb } from "@/lib/firebaseAdmin"

export async function POST() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(
        process.env.GOOGLE_APPLICATION_CREDENTIALS!
      ),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    const drive = google.drive({ version: "v3", auth })
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!

    const res = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name)",
    })

    const batch = getAdminDb().batch()

    for (const file of res.data.files || []) {
      batch.set(getAdminDb().collection("lessons").doc(file.id!), {
        title: file.name,
        driveFileId: file.id,
        createdAt: new Date(),
        source: "google-drive",
      })
    }

    await batch.commit()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
