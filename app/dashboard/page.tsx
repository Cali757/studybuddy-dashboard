"use client";

import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return router.push("/login");

      const userSnap = await getDoc(doc(db, "users", user.uid));
      setUserData(userSnap.data());

      const lessonsSnap = await getDocs(collection(db, "lessons"));
      setLessons(lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    load();
  }, []);

  if (!userData) return <p>Loading...</p>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <button
        onClick={() => {
          if (lessons.length === 0) {
            alert("No lessons yet. Import lessons first.");
          } else {
            router.push(`/lesson/${lessons[0].id}`);
          }
        }}
        className="btn-primary"
      >
        Start Learning
      </button>

      <ul className="space-y-2">
        {lessons.map(lesson => (
          <li key={lesson.id}>
            <button
              className="underline"
              onClick={() => router.push(`/lesson/${lesson.id}`)}
            >
              {lesson.title}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
