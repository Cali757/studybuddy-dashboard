"use client";

import { useRequireAuth } from "@/lib/useRequireAuth";

export default function CreatePage() {
  const { loading } = useRequireAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Create</h1>
      <p className="mt-2 text-gray-600">
        This is where creation will happen.
      </p>
    </div>
  );
}
