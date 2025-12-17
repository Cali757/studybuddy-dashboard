"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 text-2xl font-bold">
          StudyBuddy
        </div>

        <nav className="px-4 space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/lessons"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Lessons
          </Link>
          <Link
            href="/dashboard/quizzes"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Quizzes
          </Link>
          <Link
            href="/dashboard/notes"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Notes
          </Link>
          <Link
            href="/profile"
            className="block px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between">
          <h2 className="text-xl font-semibold">
            Dashboard
          </h2>
          <div className="text-sm text-gray-600">
            User
          </div>
        </header>

        <section className="p-6">
          {children}
        </section>
      </main>
    </div>
  );
}
