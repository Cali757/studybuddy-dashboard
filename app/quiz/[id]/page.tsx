'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { trackUsage } from '@/lib/trackUsage';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { getRecommendation } from '@/lib/recommendation';

interface QuizQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  explanation: string;
}

export default function QuizPage() {
  const { loading: authLoading } = useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  
  const [userId, setUserId] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [recommendation, setRecommendation] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUserId(authUser.uid);
        await trackUsage(authUser.uid, 'quiz_start', { lessonId });
        
        // Fetch lesson and generate quiz
        try {
          const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
          if (lessonDoc.exists()) {
            const lessonData = { id: lessonDoc.id, ...lessonDoc.data() };
            setLesson(lessonData);
            await generateQuiz(lessonData);
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

  const generateQuiz = async (lessonData: any) => {
    setGeneratingQuiz(true);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: lessonData.content || lessonData.transcript || lessonData.summary,
          lessonId
        })
      });
      
      const data = await response.json();
      if (Array.isArray(data.quiz)) {
        setQuiz(data.quiz);
        setAnsweredQuestions(new Array(data.quiz.length).fill(false));
      } else {
        console.error('Quiz format error:', data.quiz);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (answeredQuestions[currentQuestion]) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === quiz[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);

    // Wait 2 seconds to show feedback, then move to next question
    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        finishQuiz(score + (isCorrect ? 1 : 0));
      }
    }, 2000);
  };

  const finishQuiz = async (finalScore: number) => {
    setShowResults(true);
    const percentage = Math.round((finalScore / quiz.length) * 100);
    const recommendationText = getRecommendation(percentage);
    setRecommendation(recommendationText);

    // Save quiz results to Firestore
    if (userId) {
      try {
        await addDoc(collection(db, 'quizzes'), {
          uid: userId,
          lessonId,
          score: finalScore,
          totalQuestions: quiz.length,
          percentage,
          createdAt: new Date().toISOString()
        });
        
        await trackUsage(userId, 'quiz_complete', {
          lessonId,
          score: finalScore,
          percentage
        });
      } catch (error) {
        console.error('Error saving quiz results:', error);
      }
    }
  };

  if (loading || generatingQuiz) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
          <p style={{ color: '#718096', fontSize: '18px' }}>
            {generatingQuiz ? 'Generating quiz questions...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!lesson || quiz.length === 0) {
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
          <p style={{ color: '#718096', fontSize: '18px' }}>Unable to generate quiz</p>
          <button
            onClick={() => router.push(`/lesson/${lessonId}`)}
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
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.length) * 100);
    const passed = percentage >= 70;

    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f7fafc',
        fontFamily: 'Arial, sans-serif'
      }}>
        <header style={{
          backgroundColor: 'white',
          padding: '20px 40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 
            style={{ fontSize: '24px', color: '#667eea', margin: 0, cursor: 'pointer' }} 
            onClick={() => router.push('/dashboard')}
          >
            StudyBuddy
          </h1>
        </header>

        <main style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
              {passed ? '🎉' : '📚'}
            </div>
            
            <h1 style={{ fontSize: '32px', color: '#2d3748', marginBottom: '20px' }}>
              Quiz Complete!
            </h1>
            
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: passed ? '#48bb78' : '#f56565',
              marginBottom: '20px'
            }}>
              {score} / {quiz.length}
            </div>
            
            <div style={{
              fontSize: '24px',
              color: '#718096',
              marginBottom: '30px'
            }}>
              {percentage}% Score
            </div>

            <div style={{
              backgroundColor: passed ? '#f0fff4' : '#fff5f5',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '30px',
              borderLeft: `4px solid ${passed ? '#48bb78' : '#f56565'}`
            }}>
              <p style={{ color: '#2d3748', fontSize: '16px', margin: 0 }}>
                {recommendation}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => router.push(`/lesson/${lessonId}`)}
                style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Review Lesson
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  backgroundColor: '#48bb78',
                  color: 'white',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = quiz[currentQuestion];
  const hasAnswered = answeredQuestions[currentQuestion];

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 
          style={{ fontSize: '24px', color: '#667eea', margin: 0, cursor: 'pointer' }} 
          onClick={() => router.push('/dashboard')}
        >
          StudyBuddy
        </h1>
      </header>

      <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <span style={{ color: '#718096', fontSize: '14px' }}>
                Question {currentQuestion + 1} of {quiz.length}
              </span>
              <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                Score: {score}/{currentQuestion + (hasAnswered ? 1 : 0)}
              </span>
            </div>
            
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentQuestion + 1) / quiz.length) * 100}%`,
                height: '100%',
                backgroundColor: '#667eea',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>

          <h2 style={{ 
            fontSize: '24px', 
            color: '#2d3748', 
            marginBottom: '30px',
            lineHeight: '1.5'
          }}>
            {currentQ.question}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {Object.entries(currentQ.options).map(([letter, text]) => {
              const isSelected = selectedAnswer === letter;
              const isCorrect = letter === currentQ.correctAnswer;
              const showCorrect = hasAnswered && isCorrect;
              const showIncorrect = hasAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={letter}
                  onClick={() => handleAnswerSelect(letter)}
                  disabled={hasAnswered}
                  style={{
                    padding: '20px',
                    border: showCorrect ? '2px solid #48bb78' : showIncorrect ? '2px solid #f56565' : '2px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: showCorrect ? '#f0fff4' : showIncorrect ? '#fff5f5' : 'white',
                    cursor: hasAnswered ? 'default' : 'pointer',
                    textAlign: 'left',
                    fontSize: '16px',
                    color: '#2d3748',
                    transition: 'all 0.2s',
                    opacity: hasAnswered && !isCorrect && !isSelected ? 0.5 : 1
                  }}
                >
                  <strong>{letter}.</strong> {text}
                  {showCorrect && ' ✓'}
                  {showIncorrect && ' ✗'}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#f0f4ff',
              borderRadius: '8px',
              borderLeft: '4px solid #667eea'
            }}>
              <p style={{ color: '#2d3748', margin: 0 }}>
                <strong>Explanation:</strong> {currentQ.explanation}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
