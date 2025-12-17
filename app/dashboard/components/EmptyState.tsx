'use client';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '60px 40px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Icon */}
      <div style={{
        fontSize: '80px',
        marginBottom: '20px',
        opacity: 0.8
      }}>
        {icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '24px',
        color: '#2d3748',
        fontWeight: 'bold',
        marginBottom: '15px'
      }}>
        {title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '16px',
        color: '#718096',
        lineHeight: '1.6',
        marginBottom: '30px'
      }}>
        {description}
      </p>

      {/* Action Button */}
      <button
        onClick={onAction}
        style={{
          backgroundColor: '#667eea',
          color: 'white',
          padding: '14px 32px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s, transform 0.2s',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5568d3';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#667eea';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}
