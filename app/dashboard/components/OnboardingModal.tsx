'use client';

import { useState } from 'react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    title: "Welcome to StudyBuddy! 🎓",
    description: "Your AI-powered learning companion that helps you study smarter, not harder.",
    icon: "👋"
  },
  {
    title: "How Lessons Work 📚",
    description: "Upload your study materials or connect your Google Drive. StudyBuddy will process them and create interactive lessons tailored to your learning style.",
    icon: "📚"
  },
  {
    title: "Ask Questions Anytime 💬",
    description: "Have a question? Just ask! Our AI assistant is available 24/7 to help you understand any topic. You can type or use voice input.",
    icon: "💬"
  },
  {
    title: "Track Your Progress 📊",
    description: "Take quizzes, review your notes, and watch your progress grow. StudyBuddy keeps track of your learning journey and suggests what to study next.",
    icon: "📊"
  },
  {
    title: "Ready to Start! 🚀",
    description: "You're all set! Let's begin your learning journey. Start by asking a question or uploading your first lesson.",
    icon: "🚀"
  }
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Skip button */}
        {!isLastStep && (
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#718096',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Skip
          </button>
        )}

        {/* Icon */}
        <div style={{
          fontSize: '80px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {step.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          color: '#2d3748',
          textAlign: 'center',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          {step.title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#718096',
          textAlign: 'center',
          lineHeight: '1.6',
          marginBottom: '30px'
        }}>
          {step.description}
        </p>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '30px'
        }}>
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: index === currentStep ? '#667eea' : '#e2e8f0',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            style={{
              padding: '12px 24px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#2d3748',
              fontSize: '16px',
              fontWeight: '600',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1,
              flex: 1
            }}
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#667eea',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {isLastStep ? "Get Started!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
