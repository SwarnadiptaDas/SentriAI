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
          <h2>Evaluating Patient Data...</h2>
          <p className="loading-text">Generating clinical summary report</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="triage-result">
        <div className="clinical-card error-card">
          <h2 className="error-title">Evaluation Error</h2>
          <p className="error-message">{error}</p>
          <button className="reset-btn" onClick={onReset}>Return Home</button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const urgencyClass = result.urgency.toLowerCase();

  return (
    <div className="triage-result">
      <div className="report-header">
        <h2>Patient Summary Report</h2>
      </div>

      <div className={`urgency-card clinical-card ${urgencyClass}`}>
        <div className="urgency-badge">
          SEVERITY: {result.urgency.toUpperCase()}
        </div>
        
        <div className="explanation-section">
          <h3 className="section-title">Assessment</h3>
          <p className="explanation-text">{result.explanation}</p>
        </div>
        
        <div className="next-step-section">
          <h3 className="section-title">Recommended Action</h3>
          <p className="next-step-text">{result.next_step}</p>
        </div>
      </div>

      <div className="summary-section clinical-card">
        <h3 className="section-title">Clinical Data Recorded</h3>
        
        <div className="data-table">
          <div className="data-row">
            <div className="data-label">Heart Rate</div>
            <div className="data-value">{vitals.heartRate ? Math.round(vitals.heartRate) : '--'} bpm</div>
          </div>
          <div className="data-row">
            <div className="data-label">Respiration</div>
            <div className="data-value">{vitals.breathingRate ? Math.round(vitals.breathingRate) : '--'} rpm</div>
          </div>
          <div className="data-row symptoms-row">
            <div className="data-label">Reported Symptoms</div>
            <div className="data-value symptoms-value">
              {symptoms}
            </div>
          </div>
        </div>
      </div>

      <p className="disclaimer-text">
        Disclaimer: This is an AI-generated decision-support summary and does not constitute a medical diagnosis. Always consult a qualified healthcare professional.
      </p>

      <button className="reset-btn" onClick={onReset}>
        Start New Session
      </button>
    </div>
  );
}

export default TriageResult;
