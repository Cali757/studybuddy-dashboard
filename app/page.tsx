export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
          Welcome to StudyBuddy
        </h1>
        <p style={{ fontSize: '24px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Your AI-powered study companion. Learn smarter, not harder.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/signup" style={{
            backgroundColor: '#fff',
            color: '#667eea',
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '8px',
            display: 'inline-block',
            transition: 'transform 0.2s'
          }}>
            Get Started
          </a>
          <a href="/login" style={{
            backgroundColor: 'transparent',
            color: '#fff',
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '8px',
            border: '2px solid white',
            display: 'inline-block',
            transition: 'transform 0.2s'
          }}>
            Login
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', backgroundColor: '#f7fafc', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '50px', color: '#2d3748' }}>
          Why Choose StudyBuddy?
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🤖</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#2d3748' }}>AI-Powered</h3>
            <p style={{ color: '#718096', fontSize: '16px' }}>Get instant answers and explanations powered by advanced AI</p>
          </div>
          <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎤</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#2d3748' }}>Voice Input</h3>
            <p style={{ color: '#718096', fontSize: '16px' }}>Ask questions naturally using voice commands</p>
          </div>
          <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📚</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#2d3748' }}>Smart Study</h3>
            <p style={{ color: '#718096', fontSize: '16px' }}>Personalized study plans and progress tracking</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '20px', color: '#2d3748' }}>
          Simple Pricing
        </h2>
        <p style={{ fontSize: '18px', color: '#718096', marginBottom: '50px' }}>
          Get unlimited access to all features
        </p>
        <div style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '3px solid #667eea'
        }}>
          <h3 style={{ fontSize: '28px', marginBottom: '10px', color: '#2d3748' }}>Pro Plan</h3>
          <div style={{ marginBottom: '30px' }}>
            <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#667eea' }}>$20</span>
            <span style={{ fontSize: '18px', color: '#718096' }}>/month</span>
          </div>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <li style={{ padding: '10px 0', color: '#2d3748', fontSize: '16px' }}>✓ Unlimited AI questions</li>
            <li style={{ padding: '10px 0', color: '#2d3748', fontSize: '16px' }}>✓ Voice input support</li>
            <li style={{ padding: '10px 0', color: '#2d3748', fontSize: '16px' }}>✓ Personalized study plans</li>
            <li style={{ padding: '10px 0', color: '#2d3748', fontSize: '16px' }}>✓ Progress tracking</li>
            <li style={{ padding: '10px 0', color: '#2d3748', fontSize: '16px' }}>✓ 24/7 support</li>
          </ul>
          <a href="/signup" style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '15px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            textDecoration: 'none',
            borderRadius: '8px',
            display: 'inline-block',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            Start Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: '#2d3748', 
        color: 'white', 
        padding: '40px 20px', 
        textAlign: 'center' 
      }}>
        <p style={{ margin: 0, fontSize: '16px' }}>© 2025 StudyBuddy. All rights reserved.</p>
      </footer>
    </div>
  );
}