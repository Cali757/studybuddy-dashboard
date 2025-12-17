'use client';

interface Suggestion {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  priority: 'high' | 'medium' | 'low';
}

interface WhatsNextSuggestionProps {
  suggestions: Suggestion[];
}

export default function WhatsNextSuggestion({ suggestions }: WhatsNextSuggestionProps) {
  if (suggestions.length === 0) {
    return null;
  }

  // Sort by priority
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const topSuggestion = sortedSuggestions[0];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#f56565';
      case 'medium':
        return '#ed8936';
      case 'low':
        return '#48bb78';
      default:
        return '#667eea';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '40px',
      border: `3px solid ${getPriorityColor(topSuggestion.priority)}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Priority Badge */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        backgroundColor: getPriorityColor(topSuggestion.priority),
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {topSuggestion.priority === 'high' ? '⚠️ Recommended' : '💡 Suggested'}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '60px',
          flexShrink: 0
        }}>
          {topSuggestion.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '24px',
            color: '#2d3748',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            What's Next?
          </h3>

          <h4 style={{
            fontSize: '20px',
            color: getPriorityColor(topSuggestion.priority),
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            {topSuggestion.title}
          </h4>

          <p style={{
            fontSize: '16px',
            color: '#718096',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {topSuggestion.description}
          </p>

          <button
            onClick={topSuggestion.onAction}
            style={{
              backgroundColor: getPriorityColor(topSuggestion.priority),
              color: 'white',
              padding: '12px 28px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: `0 4px 12px ${getPriorityColor(topSuggestion.priority)}40`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${getPriorityColor(topSuggestion.priority)}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${getPriorityColor(topSuggestion.priority)}40`;
            }}
          >
            {topSuggestion.actionLabel}
          </button>
        </div>
      </div>

      {/* Additional suggestions */}
      {sortedSuggestions.length > 1 && (
        <div style={{
          marginTop: '25px',
          paddingTop: '25px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#718096',
            marginBottom: '15px',
            fontWeight: '600'
          }}>
            Other Suggestions:
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {sortedSuggestions.slice(1, 3).map((suggestion, index) => (
              <div
                key={index}
                onClick={suggestion.onAction}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#f7fafc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#edf2f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f7fafc';
                }}
              >
                <span style={{ fontSize: '24px' }}>{suggestion.icon}</span>
                <span style={{
                  fontSize: '15px',
                  color: '#2d3748',
                  fontWeight: '500',
                  flex: 1
                }}>
                  {suggestion.title}
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
