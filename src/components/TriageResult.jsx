import React, { useState, useEffect } from 'react';
import './TriageResult.css';
import { triagePatient } from '../utils/llm';

function TriageResult({ vitals, symptoms, onReset, apiKey }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchTriage() {
      if (!apiKey) {
        setError("API key is missing. Please set your Groq API key in the settings (top right gear icon).");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const triageData = await triagePatient({
          heartRate: vitals.heartRate,
          breathingRate: vitals.breathingRate,
          symptoms,
          apiKey
        });
        
        if (mounted) {
          setResult(triageData);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "An error occurred during triage analysis.");
          setLoading(false);
        }
      }
    }

    fetchTriage();

    return () => {
      mounted = false;
    };
  }, [vitals, symptoms, apiKey]);

  if (loading) {
    return (
      <div className="triage-result">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Analyzing your health data...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>AI is evaluating your symptoms and vitals</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="triage-result">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--emergency)' }}>
          <h2 style={{ color: 'var(--emergency)', marginBottom: '1rem' }}>Analysis Error</h2>
          <p style={{ marginBottom: '2rem' }}>{error}</p>
          <button className="btn-secondary" onClick={onReset}>Return Home</button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const urgencyClass = result.urgency.toLowerCase();
  const urgencyEmoji = urgencyClass === 'emergency' ? '🔴' : urgencyClass === 'urgent' ? '🟡' : '🟢';

  return (
    <div className="triage-result">
      <div className={`urgency-card glass-card ${urgencyClass}`}>
        <div className="urgency-badge">
          {urgencyEmoji} {result.urgency.toUpperCase()}
        </div>
        
        <p className="explanation-text">{result.explanation}</p>
        
        <div className="next-step-card glass-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `var(--${urgencyClass})`, flexShrink: 0, marginTop: '2px' }}>
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Recommended Action</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{result.next_step}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-section glass-card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Data Analyzed</h3>
        
        <div className="vitals-badges">
          <div className="vital-badge">
            <span className="vital-icon">❤️</span>
            <span className="vital-value">{vitals.heartRate ? Math.round(vitals.heartRate) : '--'} bpm</span>
          </div>
          <div className="vital-badge">
            <span className="vital-icon">🫁</span>
            <span className="vital-value">{vitals.breathingRate ? Math.round(vitals.breathingRate) : '--'} rpm</span>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-xs)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          "{symptoms.length > 150 ? symptoms.substring(0, 150) + '...' : symptoms}"
        </div>
      </div>

      <p className="disclaimer-text">
        ⚠️ This is a decision-support tool, not a medical diagnosis. Always consult a healthcare professional.
      </p>

      <button className="btn-secondary reset-btn" onClick={onReset}>
        Start Over
      </button>
    </div>
  );
}

export default TriageResult;
