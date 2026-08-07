import React from 'react';
import './WelcomeScreen.css';

function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-blue)" />
              <stop offset="100%" stopColor="var(--accent-cyan)" />
            </linearGradient>
          </defs>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          <path d="M3 12h5l2.5-4 4 9 2.5-5H21" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <h1 className="welcome-title">AI Health Kiosk</h1>
      <p className="welcome-tagline">Contactless vitals monitoring & AI-powered symptom triage</p>

      <div className="steps-flow">
        <div className="step-pill glass-card">
          <span>📷</span> Scan Vitals
        </div>
        <div className="step-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="step-pill glass-card">
          <span>🎤</span> Describe Symptoms
        </div>
        <div className="step-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="step-pill glass-card">
          <span>🤖</span> Get Triage
        </div>
      </div>

      <button className="btn-primary start-btn" onClick={onStart}>
        Start Health Check
      </button>

      <div className="disclaimer">
        ⚠️ This is a decision-support prototype, not a certified medical device. Always consult a healthcare professional.
      </div>
    </div>
  );
}

export default WelcomeScreen;
