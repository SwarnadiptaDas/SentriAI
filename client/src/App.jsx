import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import VitalsScan from './components/VitalsScan';
import SymptomIntake from './components/SymptomIntake';
import TriageResult from './components/TriageResult';
import WaveformStrip from './components/WaveformStrip';
import { startSession, saveVitals, saveSymptoms, runTriage } from './api';
import './index.css';

function App() {
  const [screen, setScreen] = useState('welcome');
  const [sessionId, setSessionId] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = async () => {
    try {
      const res = await startSession();
      setSessionId(res.session_id);
      setScreen('vitals');
    } catch (err) {
      console.error('Failed to start session:', err);
      // fallback for offline mode
      setSessionId('OFFLINE_MODE');
      setScreen('vitals');
    }
  };

  const handleVitalsComplete = async (scannedVitals) => {
    setVitals(scannedVitals);
    if (sessionId && sessionId !== 'OFFLINE_MODE') {
      await saveVitals(sessionId, scannedVitals);
    }
    setScreen('symptoms');
  };

  const handleSymptomsSubmit = async (transcript) => {
    setSymptoms(transcript);
    setIsProcessing(true);
    setScreen('triage');
    
    if (sessionId && sessionId !== 'OFFLINE_MODE') {
      await saveSymptoms(sessionId, { transcript, language: 'en-US' });
      const result = await runTriage(sessionId);
      setTriageResult(result);
    } else {
      // Mock result for offline
      setTriageResult({
        urgency: 'Routine',
        explanation: 'Offline mode active. Symptoms recorded locally.',
        next_step: 'Please consult a doctor when online.',
        key_factors: ['Offline']
      });
    }
    setIsProcessing(false);
  };

  const handleReset = () => {
    setScreen('welcome');
    setSessionId(null);
    setVitals(null);
    setSymptoms('');
    setTriageResult(null);
  };

  return (
    <div className="min-h-screen bg-navy-gradient text-slate-100 font-sans flex flex-col relative pt-8">
      <WaveformStrip active={screen === 'vitals' && sessionId !== null} alert={triageResult?.urgency === 'Emergency'} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        {screen === 'welcome' && (
          <WelcomeScreen onStart={handleStart} />
        )}
        
        {screen === 'vitals' && (
          <VitalsScan onComplete={handleVitalsComplete} />
        )}
        
        {screen === 'symptoms' && (
          <SymptomIntake onSubmit={handleSymptomsSubmit} />
        )}
        
        {screen === 'triage' && (
          <TriageResult 
            result={triageResult} 
            isProcessing={isProcessing} 
            onReset={handleReset}
            sessionId={sessionId}
          />
        )}
      </main>
    </div>
  );
}

export default App;
