'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import OnboardingModal from './components/OnboardingModal';
import FirstWinCTA from './components/FirstWinCTA';
import EmptyState from './components/EmptyState';
import ProgressIndicator from './components/ProgressIndicator';
import WhatsNextSuggestion from './components/WhatsNextSuggestion';
// import { trackUsage } from '@/lib/trackUsage';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const questionInputRef = useRef<HTMLInputElement>(null);
  
  // Track if user has content (for empty states)
  const [hasLessons, setHasLessons] = useState(false);
  const [hasQuestions, setHasQuestions] = useState(false);
  const [hasQuizzes, setHasQuizzes] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);
  
  // Progress tracking
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [quizzesPassed, setQuizzesPassed] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  
  // User data from Firebase
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const studyStreak = userData?.streak || 0;
  const questionsAsked = 42;
  const hoursStudied = 15;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        setUserId(authUser.uid);
        // Check if user has completed onboarding
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            // Show onboarding if hasOnboarded is false or undefined
            if (!data.hasOnboarded) {
              setShowOnboarding(true);
              setIsNewUser(true);
            }
            
            // Update streak tracking
            await updateStreakTracking(authUser.uid, data);
            
            // Track dashboard visit
            await trackUsage(authUser.uid, 'dashboard_visit', {});
          } else {
            // User document doesn't exist yet, treat as new user
            setIsNewUser(true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to update streak tracking
  const updateStreakTracking = async (uid: string, userData: any) => {
    try {
      const now = new Date();
      const lastActive = userData.lastActiveAt ? new Date(userData.lastActiveAt) : null;
      
      let newStreak = userData.streak || 0;
      
      if (lastActive) {
        // Calculate days difference
        const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day, no change to streak
          return;
        } else if (daysDiff === 1) {
          // Consecutive day, increment streak
          newStreak += 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }
      } else {
        // First time tracking, start streak at 1
        newStreak = 1;
      }
      
      // Update user document with new streak and lastActiveAt
      await updateDoc(doc(db, 'users', uid), {
        streak: newStreak,
        lastActiveAt: now.toISOString()
      });
      
      // Update local state
      setUserData((prev: any) => ({
        ...prev,
        streak: newStreak,
        lastActiveAt: now.toISOString()
      }));
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    if (userId) {
      try {
        // Mark user as onboarded in Firestore
        await updateDoc(doc(db, 'users', userId), {
          hasOnboarded: true
        });
        setShowOnboarding(false);
      } catch (error) {
        console.error('Error updating onboarding status:', error);
        // Still close the modal even if update fails
        setShowOnboarding(false);
      }
    }
  };

  const handleAskQuestion = () => {
    // Scroll to and focus the question input
    questionInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      questionInputRef.current?.focus();
    }, 500);
  };

  const handleStartLesson = () => {
    // For now, just alert - in real app would navigate to lesson upload
    alert('Lesson upload feature coming soon! For now, try asking a question.');
    handleAskQuestion();
  };

  const handleCreateNote = () => {
    alert('Notes feature coming soon! You can create notes while studying your lessons.');
  };

  const handleTakeQuiz = () => {
    alert('Quiz feature coming soon! Complete lessons first to unlock quizzes.');
  };

  const handleReviewLesson = () => {
    alert('Review feature coming soon! You can review lessons to improve your quiz scores.');
  };

  // Generate suggestions based on user activity
  const getSuggestions = () => {
    const suggestions = [];

    // Low quiz score → suggest review
    if (averageScore > 0 && averageScore < 70) {
      suggestions.push({
        icon: '📚',
        title: 'Review Your Lessons',
        description: `Your average quiz score is ${averageScore}%. Reviewing your lessons can help improve your understanding and boost your scores.`,
        actionLabel: 'Start Reviewing',
        onAction: handleReviewLesson,
        priority: 'high' as const
      });
    }

    // Finished lesson → suggest next lesson
    if (lessonsCompleted > 0 && lessonsCompleted < totalLessons) {
      suggestions.push({
        icon: '🚀',
        title: 'Continue Your Learning',
        description: `You've completed ${lessonsCompleted} out of ${totalLessons} lessons. Keep the momentum going!`,
        actionLabel: 'Next Lesson',
        onAction: handleStartLesson,
        priority: 'medium' as const
      });
    }

    // No activity → suggest starting
    if (totalLessons === 0 && totalQuizzes === 0) {
      suggestions.push({
        icon: '🎓',
        title: 'Start Your Learning Journey',
        description: 'Upload your first lesson or ask a question to get started with StudyBuddy.',
        actionLabel: 'Get Started',
        onAction: handleAskQuestion,
        priority: 'high' as const
      });
    }

    // Good progress → suggest quiz
    if (averageScore >= 70 && quizzesPassed < totalQuizzes) {
      suggestions.push({
        icon: '✅',
        title: 'Test Your Knowledge',
        description: `Great job! You're doing well with an average score of ${averageScore}%. Ready for the next quiz?`,
        actionLabel: 'Take Quiz',
        onAction: handleTakeQuiz,
        priority: 'medium' as const
      });
    }

    // Completed everything
    if (lessonsCompleted === totalLessons && quizzesPassed === totalQuizzes && totalLessons > 0) {
      suggestions.push({
        icon: '🏆',
        title: 'You\'re All Caught Up!',
        description: 'Amazing work! You\'ve completed all your lessons and quizzes. Upload new materials to continue learning.',
        actionLabel: 'Add More Content',
        onAction: handleStartLesson,
        priority: 'low' as const
      });
    }

    return suggestions;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ fontSize: '24px', color: '#667eea' }}>Loading...</div>
      </div>
    );
  }
  
  // For demo purposes - in real app, fetch from Firestore
  const recentQuestions = hasQuestions ? [
    { id: 1, question: "What is photosynthesis?", time: "2 hours ago" },
    { id: 2, question: "Explain Newton's laws of motion", time: "5 hours ago" },
    { id: 3, question: "How does DNA replication work?", time: "1 day ago" }
  ] : [];
  
  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      
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
        <h1 style={{ fontSize: '24px', color: '#667eea', margin: 0, cursor: 'pointer' }} onClick={() => window.location.href = '/dashboard'}>StudyBuddy</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/dashboard" style={{ color: '#718096', textDecoration: 'none', fontWeight: '600' }}>Dashboard</a>
          <a href="#lessons" style={{ color: '#718096', textDecoration: 'none' }}>Lessons</a>
          <a href="#notes" style={{ color: '#718096', textDecoration: 'none' }}>Notes</a>
          <a href="#quizzes" style={{ color: '#718096', textDecoration: 'none' }}>Quizzes</a>
          <button 
            onClick={() => {
              auth.signOut();
              window.location.href = '/';
            }}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              padding: '8px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}>
            Logout
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* First Win CTA for new users */}
        {isNewUser && (
          <FirstWinCTA 
            onAskQuestion={handleAskQuestion}
            onStartLesson={handleStartLesson}
          />
        )}

        {/* Welcome Section */}
        <div style={{ marginBottom: '40px' }}>
          <h1 className="text-xl font-semibold">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ""} 👋
          </h1>
          <p style={{ color: '#718096', fontSize: '18px' }}>
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          lessonsCompleted={lessonsCompleted}
          totalLessons={totalLessons}
          quizzesPassed={quizzesPassed}
          totalQuizzes={totalQuizzes}
          averageScore={averageScore}
        />

        {/* What's Next Suggestions */}
        <WhatsNextSuggestion suggestions={getSuggestions()} />

        {/* Continue Studying Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
            Continue Studying
          </h3>
          {userData?.lastLessonId ? (
            <div>
              <p style={{ color: '#718096', marginBottom: '20px' }}>
                Pick up where you left off with your recent lessons and activities.
              </p>
              <a 
                href={`/lesson/${userData.lastLessonId}`}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#667eea',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Continue where you left off →
              </a>
            </div>
          ) : (
            <p style={{ color: '#718096' }}>
              Pick up where you left off with your recent lessons and activities.
            </p>
          )}
        </div>

        {/* Recent Lessons Section */}
        {userData?.recentLessons && userData.recentLessons.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '40px'
          }}>
            <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
              Recently Viewed Lessons
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userData.recentLessons.map((lessonId: string, index: number) => (
                <a
                  key={lessonId}
                  href={`/lesson/${lessonId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#f7fafc',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#2d3748',
                    transition: 'background-color 0.2s',
                    border: '1px solid #e2e8f0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#edf2f7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                >
                  <span style={{ fontSize: '24px', marginRight: '16px' }}>📚</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Lesson {lessonId}</div>
                    <div style={{ fontSize: '14px', color: '#718096' }}>Click to continue</div>
                  </div>
                  <span style={{ color: '#667eea', fontWeight: '600' }}>→</span>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔥</div>
            <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '5px' }}>{studyStreak} Days</h3>
            <p style={{ color: '#718096', margin: 0 }}>Study Streak</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>❓</div>
            <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '5px' }}>{questionsAsked}</h3>
            <p style={{ color: '#718096', margin: 0 }}>Questions Asked</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏱️</div>
            <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '5px' }}>{hoursStudied}h</h3>
            <p style={{ color: '#718096', margin: 0 }}>Hours Studied</p>
          </div>
        </div>
        
        {/* My Lessons Section */}
        <div id="lessons" style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          scrollMarginTop: '80px'
        }}>
          <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
            Your Lessons
          </h3>
          {!hasLessons ? (
            <EmptyState
              icon="📚"
              title="No Lessons Yet"
              description="Upload your study materials or connect your Google Drive to create your first lesson. StudyBuddy will transform them into interactive learning experiences."
              actionLabel="Upload Your First Lesson"
              onAction={handleStartLesson}
            />
          ) : (
            <div style={{ color: '#718096' }}>
              Your lessons will appear here...
            </div>
          )}
        </div>

        {/* My Notes Section */}
        <div id="notes" style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          scrollMarginTop: '80px'
        }}>
          <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
            My Notes
          </h3>
          {!hasNotes ? (
            <EmptyState
              icon="📝"
              title="No Notes Yet"
              description="Take notes while studying to remember key concepts. Your notes are automatically organized and searchable."
              actionLabel="Create Your First Note"
              onAction={handleCreateNote}
            />
          ) : (
            <div style={{ color: '#718096' }}>
              Your notes will appear here...
            </div>
          )}
        </div>

        {/* My Quizzes Section */}
        <div id="quizzes" style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          scrollMarginTop: '80px'
        }}>
          <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
            My Quizzes
          </h3>
          {!hasQuizzes ? (
            <EmptyState
              icon="✅"
              title="No Quizzes Yet"
              description="Test your knowledge with AI-generated quizzes. Complete lessons to unlock personalized quizzes based on your study materials."
              actionLabel="Take Your First Quiz"
              onAction={handleTakeQuiz}
            />
          ) : (
            <div style={{ color: '#718096' }}>
              Your quizzes will appear here...
            </div>
          )}
        </div>

        {/* Ask Question Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
            Ask a Question
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              ref={questionInputRef}
              type="text"
              placeholder="What would you like to learn today?"
              style={{
                flex: 1,
                padding: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            <button 
              onClick={() => {
                const input = questionInputRef.current;
                if (input && input.value.trim()) {
                  alert(`AI is processing your question: "${input.value}"\n\nThis feature is coming soon!`);
                } else {
                  alert('Please enter a question first!');
                }
              }}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '14px 30px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
              Ask AI
            </button>
            <button 
              onClick={() => {
                alert('🎤 Voice input feature coming soon! For now, please type your question.');
              }}
              style={{
                backgroundColor: '#48bb78',
                color: 'white',
                padding: '14px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '20px',
                cursor: 'pointer'
              }}>
              🎤
            </button>
          </div>
        </div>
        
        {/* Recent Questions or Empty State */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
            Recent Activity
          </h3>
          {recentQuestions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {recentQuestions.map((q) => (
                <div key={q.id} style={{
                  padding: '15px',
                  backgroundColor: '#f7fafc',
                  borderRadius: '8px',
                  borderLeft: '4px solid #667eea'
                }}>
                  <p style={{ color: '#2d3748', margin: '0 0 5px 0', fontWeight: '500' }}>
                    {q.question}
                  </p>
                  <p style={{ color: '#718096', margin: 0, fontSize: '14px' }}>
                    {q.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="💬"
              title="No Questions Yet"
              description="Start your learning journey by asking your first question. Our AI tutor is ready to help you understand any topic!"
              actionLabel="Ask Your First Question"
              onAction={handleAskQuestion}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        padding: '30px 40px',
        marginTop: '60px',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ color: '#718096', fontSize: '14px' }}>
            © 2025 StudyBuddy. Your AI-powered learning companion.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/changelog" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>Changelog</a>
            <a href="/privacy" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>Privacy</a>
            <a href="/terms" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
