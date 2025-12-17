'use client';

interface FirstWinCTAProps {
  onAskQuestion: () => void;
  onStartLesson: () => void;
}

export default function FirstWinCTA({ onAskQuestion, onStartLesson }: FirstWinCTAProps) {
  return (
    <div style={{
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
      marginBottom: '40px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '15px'
        }}>
          🎉 Get Started
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '15px',
          lineHeight: '1.2'
        }}>
          Ready for Your First Win?
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '18px',
          marginBottom: '30px',
          opacity: 0.95,
          lineHeight: '1.5'
        }}>
          Start your learning journey in under 5 minutes. Choose what works best for you:
        </p>

        {/* Action buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {/* Ask Question Card */}
          <div
            onClick={onAskQuestion}
            style={{
              backgroundColor: 'white',
              color: '#2d3748',
              padding: '30px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>💬</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#667eea'
            }}>
              Ask a Question
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#718096',
              lineHeight: '1.5',
              marginBottom: '15px'
            }}>
              Get instant answers from our AI tutor. Perfect for quick learning!
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#667eea',
              fontWeight: '600',
              fontSize: '15px'
            }}>
              Try it now →
            </div>
          </div>

          {/* Start Lesson Card */}
          <div
            onClick={onStartLesson}
            style={{
              backgroundColor: 'white',
              color: '#2d3748',
              padding: '30px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>📚</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#667eea'
            }}>
              Upload a Lesson
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#718096',
              lineHeight: '1.5',
              marginBottom: '15px'
            }}>
              Upload study materials and let AI create personalized lessons.
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#667eea',
              fontWeight: '600',
              fontSize: '15px'
            }}>
              Get started →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
