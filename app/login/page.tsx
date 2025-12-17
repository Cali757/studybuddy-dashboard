export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          marginBottom: '10px', 
          color: '#2d3748',
          textAlign: 'center'
        }}>
          Welcome Back
        </h1>
        <p style={{ 
          color: '#718096', 
          textAlign: 'center', 
          marginBottom: '30px' 
        }}>
          Login to your StudyBuddy account
        </p>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2d3748',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2d3748',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button
            type="button"
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Login
          </button>
        </form>
        
        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          color: '#718096',
          fontSize: '14px'
        }}>
          Don't have an account?{' '}
          <a href="/signup" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
            Sign up
          </a>
        </p>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/" style={{ color: '#718096', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
