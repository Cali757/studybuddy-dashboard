'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { trackUsage } from '@/lib/trackUsage';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function QuizPage() {
  const { loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Sample quiz questions
  const questions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUserId(authUser.uid);
        // Track quiz start
        await trackUsage(authUser.uid, 'quiz_start', {});
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAnswerClick = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null);
      } else {
        setShowResults(true);
        // Track quiz completion
        if (userId) {
          trackUsage(userId, 'quiz_complete', { score, totalQuestions: questions.length });
        }
      }
    }, 1000);
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!userId) return;

    try {
      await addDoc(collection(db, "Feedback"), {
        userId,
        lessonId: "quiz-general",
        helpful,
        createdAt: new Date().toISOString(),
      });
      setShowFeedback(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const calculatePercentage = () => {
    return Math.round((score / questions.length) * 100);
  };

  if (showResults) {
    const percentage = calculatePercentage();
    const passed = percentage >= 70;

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

        {/* Results */}
        <main style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '32px', color: '#2d3748', marginBottom: '20px' }}>
              Quiz Complete!
            </h1>
            
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
              {passed ? '🎉' : '📚'}
            </div>

            <p style={{ fontSize: '24px', color: '#2d3748', marginBottom: '10px' }}>
              Your Score: {score} / {questions.length}
            </p>
            
            <p style={{ fontSize: '20px', color: '#718096', marginBottom: '30px' }}>
              {percentage}%
            </p>

            {passed && (
              <p className="text-green-600" style={{ color: '#48bb78', fontSize: '18px', fontWeight: '600', marginBottom: '30px' }}>
                Nice work — keep going ✅
              </p>
            )}

            {!showFeedback && (
              <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ color: '#2d3748', marginBottom: '15px', fontSize: '16px' }}>
                  Was this quiz helpful?
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleFeedback(true)}
                    style={{
                      backgroundColor: '#48bb78',
                      color: 'white',
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    👍 Helpful
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    style={{
                      backgroundColor: '#f56565',
                      color: 'white',
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    👎 Not Helpful
                  </button>
                </div>
              </div>
            )}

            {showFeedback && (
              <p style={{ color: '#48bb78', marginTop: '20px', fontSize: '16px' }}>
                Thank you for your feedback! 🙏
              </p>
            )}

            <button
              onClick={() => {
                setCurrentQuestion(0);
                setScore(0);
                setShowResults(false);
                setSelectedAnswer(null);
                setShowFeedback(false);
              }}
              style={{
                marginTop: '30px',
                backgroundColor: '#667eea',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Try Again
            </button>
          </div>
        </main>
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

      {/* Quiz Content */}
      <main style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px', color: '#718096' }}>
            Question {currentQuestion + 1} of {questions.length}
          </div>

          <h2 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '30px' }}>
            {questions[currentQuestion].question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={selectedAnswer !== null}
                style={{
                  padding: '15px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: selectedAnswer === index 
                    ? (index === questions[currentQuestion].correctAnswer ? '#c6f6d5' : '#fed7d7')
                    : 'white',
                  color: '#2d3748',
                  fontSize: '16px',
                  cursor: selectedAnswer === null ? 'pointer' : 'default',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: selectedAnswer !== null && selectedAnswer !== index ? 0.5 : 1
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '30px', color: '#718096', fontSize: '14px' }}>
            Score: {score} / {currentQuestion + (selectedAnswer !== null ? 1 : 0)}
          </div>
        </div>
      </main>
    </div>
  );
}
