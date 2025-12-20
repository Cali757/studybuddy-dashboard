import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const audio = formData.get("audio") as File;

  const transcript = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
  });

  return NextResponse.json({ text: transcript.text });
}
