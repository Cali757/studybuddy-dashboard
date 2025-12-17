'use client';

interface ProgressIndicatorProps {
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  averageScore: number;
}

export default function ProgressIndicator({
  lessonsCompleted,
  totalLessons,
  quizzesPassed,
  totalQuizzes,
  averageScore
}: ProgressIndicatorProps) {
  const lessonProgress = totalLessons > 0 ? (lessonsCompleted / totalLessons) * 100 : 0;
  const quizProgress = totalQuizzes > 0 ? (quizzesPassed / totalQuizzes) * 100 : 0;

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '40px'
    }}>
      <h3 style={{
        fontSize: '24px',
        color: '#2d3748',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span>📊</span> Your Progress
      </h3>

      {/* Progress Items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
      }}>
        {/* Lessons Progress */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{
              fontSize: '16px',
              color: '#2d3748',
              fontWeight: '600'
            }}>
              Lessons Completed
            </span>
            <span style={{
              fontSize: '16px',
              color: '#667eea',
              fontWeight: 'bold'
            }}>
              {lessonsCompleted} / {totalLessons}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${lessonProgress}%`,
              height: '100%',
              backgroundColor: '#667eea',
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }} />
          </div>
        </div>

        {/* Quizzes Progress */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{
              fontSize: '16px',
              color: '#2d3748',
              fontWeight: '600'
            }}>
              Quizzes Passed
            </span>
            <span style={{
              fontSize: '16px',
              color: '#48bb78',
              fontWeight: 'bold'
            }}>
              {quizzesPassed} / {totalQuizzes}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${quizProgress}%`,
              height: '100%',
              backgroundColor: '#48bb78',
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }} />
          </div>
        </div>

        {/* Average Score */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f7fafc',
          borderRadius: '8px',
          border: '2px solid #e2e8f0'
        }}>
          <div>
            <div style={{
              fontSize: '14px',
              color: '#718096',
              marginBottom: '5px'
            }}>
              Average Quiz Score
            </div>
            <div style={{
              fontSize: '32px',
              color: '#2d3748',
              fontWeight: 'bold'
            }}>
              {averageScore}%
            </div>
          </div>
          <div style={{
            fontSize: '60px',
            opacity: 0.8
          }}>
            {averageScore >= 90 ? '🎉' : averageScore >= 70 ? '🚀' : averageScore >= 50 ? '💪' : '📚'}
          </div>
        </div>

        {/* Motivational Message */}
        {totalLessons === 0 && totalQuizzes === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#718096',
            fontSize: '15px',
            fontStyle: 'italic'
          }}>
            Start learning to see your progress here! 🎓
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#f0f4ff',
            borderRadius: '8px',
            color: '#667eea',
            fontSize: '15px',
            fontWeight: '600'
          }}>
            {lessonProgress === 100 && quizProgress === 100
              ? '🏆 Amazing! You\'ve completed everything!'
              : lessonProgress >= 50
              ? '🚀 Great progress! Keep it up!'
              : '💪 You\'re just getting started. Keep going!'}
          </div>
        )}
      </div>
    </div>
  );
}
