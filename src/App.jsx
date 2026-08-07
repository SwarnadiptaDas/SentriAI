import React, { useState, useEffect } from 'react';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import VitalsScan from './components/VitalsScan';
import SymptomIntake from './components/SymptomIntake';
import TriageResult from './components/TriageResult';

function App() {
  const [screen, setScreen] = useState('welcome'); // welcome | vitals | symptoms | triage
  const [vitals, setVitals] = useState({ heartRate: null, breathingRate: null });
  const [symptoms, setSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('groq_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
    setShowSettings(false);
  };

  const handleStart = () => setScreen('vitals');
  
  const handleVitalsComplete = (recordedVitals) => {
    setVitals(recordedVitals);
    setScreen('symptoms');
  };

  const handleSymptomsSubmit = (transcript) => {
    setSymptoms(transcript);
    setScreen('triage');
  };

  const handleReset = () => {
    setScreen('welcome');
    setVitals({ heartRate: null, breathingRate: null });
    setSymptoms('');
    setTriageResult(null);
  };

  return (
    <div className="app">
      <button className="settings-btn" onClick={() => setShowSettings(true)} aria-label="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {showSettings && (
        <div className="settings-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className="settings-modal glass-card">
            <h2 style={{ marginBottom: '1rem' }}>Settings</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Groq API Key</label>
              <input 
                type="password" 
                className="settings-input" 
                defaultValue={apiKey} 
                placeholder="gsk_..."
                id="api-key-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" style={{ minHeight: '40px', padding: '8px 16px' }} onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn-primary" style={{ minHeight: '40px', padding: '8px 16px' }} onClick={() => saveApiKey(document.getElementById('api-key-input').value)}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className={`screen-container screen-enter key-${screen}`}>
        {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
        {screen === 'vitals' && <VitalsScan onComplete={handleVitalsComplete} />}
        {screen === 'symptoms' && <SymptomIntake onSubmit={handleSymptomsSubmit} />}
        {screen === 'triage' && <TriageResult vitals={vitals} symptoms={symptoms} onReset={handleReset} apiKey={apiKey} />}
      </div>
    </div>
  );
}

export default App;
