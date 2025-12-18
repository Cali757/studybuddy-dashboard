"use client";

import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  console.log("Signup page rendered"); // 🔍 DEBUG

  const auth = getAuth(app);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("CREATE CLICKED"); // 🔍 DEBUG

    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("USER CREATED:", user.user.email);
      alert("Account created successfully!");
    } catch (err: any) {
      console.error("SIGNUP ERROR:", err);
      alert(err.message);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br /><br />

        <button type="submit">
          Create Account
        </button>
      </form>
    </div>
  );
}