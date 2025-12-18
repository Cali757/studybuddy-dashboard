"use client";
import { useRouter } from "next/navigation";

export default function CreateButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/create")}
      className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
    >
      Create
    </button>
  );
}
