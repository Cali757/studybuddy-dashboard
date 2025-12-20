// app/lesson/[id]/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function Lesson({ params }: any) {
  const snap = await getDoc(doc(db, "lessons", params.id));
  const lesson = snap.data();

  if (!lesson) return <p>Lesson not found</p>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">{lesson.title}</h1>
      <pre className="whitespace-pre-wrap mt-4">
        {lesson.transcript}
      </pre>
    </main>
  );
}
