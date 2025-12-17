export default function DashboardPage() {
  // Fake data for demonstration
  const userName = "John Doe";
  const studyStreak = 7;
    const questionsAsked = 42;
  const hoursStudied = 15;
  
  const recentQuestions = [
    { id: 1, question: "What is photosynthesis?", time: "2 hours ago" },
    { id: 2, question: "Explain Newton's laws of motion", time: "5 hours ago" },
    { id: 3, question: "How does DNA replication work?", time: "1 day ago" }
  ];
  
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
        <h1 style={{ fontSize: '24px', color: '#667eea', margin: 0 }}>StudyBuddy</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/" style={{ color: '#718096', textDecoration: 'none' }}>Home</a>
          <button style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '8px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', color: '#2d3748', marginBottom: '10px' }}>
            Welcome back, {userName}! 👋
          </h2>
          <p style={{ color: '#718096', fontSize: '18px' }}>
            Ready to continue your learning journey?
          </p>
        </div>
        
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
            <button style={{
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
            <button style={{
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
        
        {/* Recent Questions */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '24px', color: '#2d3748', marginBottom: '20px' }}>
            Recent Questions
          </h3>
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
        </div>
      </main>
    </div>
  );
}
