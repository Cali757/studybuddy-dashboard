"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getAuth } from "firebase/auth";
import app from "@/lib/firebase";

export default function Dashboard() {
  const loading = useRequireAuth();
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (loading) return <div style={{ padding: 40 }}><p>Loading dashboard...</p></div>;

  return (
    <div style={{ padding: 40 }} className="space-y-6">
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Welcome back{user?.email ? `, ${user.email}` : ''}!</h1>
      
      <section style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>📘 Continue Learning</h2>
        <p>Your recent courses will appear here.</p>
      </section>

      <section style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>🤖 Ask StudyBuddy</h2>
        <p>Get AI-powered help with your studies.</p>
      </section>

      <section style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>🧪 Resume Quiz</h2>
        <p>Continue where you left off.</p>
      </section>

      <section style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>📈 Your Progress</h2>
        <p>Track your learning journey.</p>
      </section>
    </div>
  );
}