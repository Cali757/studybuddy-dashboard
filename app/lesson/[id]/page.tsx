'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { trackUsage } from '@/lib/trackUsage';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function LessonPage() {
  const { loading: authLoading } = useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUserId(authUser.uid);
        
        // Track that user viewed this lesson
        try {
          // Fetch current user data to get existing recentLessons
          const userDoc = await getDoc(doc(db, "users", authUser.uid));
          const currentRecentLessons = userDoc.exists() ? (userDoc.data().recentLessons || []) : [];
          
          // Add current lesson to the beginning, remove duplicates, keep max 5
          const updatedRecentLessons = [
            lessonId,
            ...currentRecentLessons.filter((id: string) => id !== lessonId)
          ].slice(0, 5);
          
          await updateDoc(doc(db, "users", authUser.uid), {
            lastLessonId: lessonId,
            recentLessons: updatedRecentLessons,
          });
          
          // Track lesson view
          await trackUsage(authUser.uid, 'lesson_view', { lessonId });
        } catch (error) {
          console.error('Error updating lastLessonId:', error);
        }
        
        // Fetch lesson data
        try {
          const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
          if (lessonDoc.exists()) {
            setLesson({ id: lessonDoc.id, ...lessonDoc.data() });
          }
        } catch (error) {
          console.error('Error fetching lesson:', error);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [lessonId, router]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
          <p style={{ color: '#718096', fontSize: '18px' }}>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <p style={{ color: '#718096', fontSize: '18px' }}>Lesson not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              marginTop: '20px',
              backgroundColor: '#667eea',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 
          style={{ fontSize: '24px', color: '#667eea', margin: 0, cursor: 'pointer' }} 
          onClick={() => router.push('/dashboard')}
        >
          StudyBuddy
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '8px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ fontSize: '32px', color: '#2d3748', marginBottom: '20px' }}>
            {lesson.title || 'Untitled Lesson'}
          </h1>
          
          <div style={{ 
            color: '#718096', 
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <p><strong>Source:</strong> {lesson.source || 'N/A'}</p>
            <p><strong>Status:</strong> {lesson.status || 'N/A'}</p>
          </div>

          <div style={{ 
            color: '#2d3748',
            lineHeight: '1.8',
            fontSize: '16px'
          }}>
            {lesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : lesson.summary ? (
              <p>{lesson.summary}</p>
            ) : (
              <p style={{ color: '#718096', fontStyle: 'italic' }}>
                No content available for this lesson yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
