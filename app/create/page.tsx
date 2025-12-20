"use client";

import { useRequireAuth } from "@/lib/useRequireAuth";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const { loading, user } = useRequireAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const lessonData = {
        title: title.trim(),
        content: content.trim(),
        userId: user?.uid || "anonymous",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "lessons"), lessonData);
      console.log("Lesson created with ID:", docRef.id);
      
      // Redirect to the lesson page
      router.push(`/lesson/${docRef.id}`);
    } catch (err) {
      console.error("Error creating lesson:", err);
      setError("Failed to create lesson. Please try again.");
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Lesson</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter lesson title..."
            disabled={creating}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your lesson content here...\n\nExample:\nPhotosynthesis is the process by which plants convert light energy into chemical energy..."
            disabled={creating}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {creating ? "Creating..." : "Create Lesson"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            disabled={creating}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
