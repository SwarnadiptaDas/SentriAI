import React, { useEffect, useState } from 'react';
import { getFacilities } from '../api';

const TriageResult = ({ result, isProcessing, onReset, sessionId }) => {
  const [facilities, setFacilities] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (result && !result.needs_followup && result.urgency) {
      getFacilities(result.urgency).then(data => setFacilities(data)).catch(err => console.error(err));
    }
  }, [result]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center gap-6 animate-[fadeSlideIn_0.5s_ease]">
        <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-mint animate-spin"></div>
        <h2 className="text-2xl font-bold text-white">Analyzing Data</h2>
        <p className="text-slate-400 max-w-sm">Combining vitals and symptom history to determine clinical severity...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card p-8 border-l-4 border-l-emergency text-center animate-[fadeSlideIn_0.5s_ease]">
        <h2 className="text-xl font-bold text-emergency mb-2">Error</h2>
        <p className="text-slate-300 mb-6">Failed to generate triage result.</p>
        <button className="btn-secondary" onClick={onReset}>Start Over</button>
      </div>
    );
  }

  if (result.needs_followup) {
    return (
      <div className="glass-card flex flex-col items-center p-8 max-w-2xl w-full text-center animate-[fadeSlideIn_0.5s_ease]">
        <div className="bg-urgent/10 text-urgent px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">Clarification Needed</div>
        <h2 className="text-2xl font-bold text-white mb-6">The AI needs more info:</h2>
        <div className="bg-navy-900 border border-slate-700/50 p-6 rounded-xl w-full mb-8 text-left">
          <p className="text-lg text-slate-200">"{result.followup_question}"</p>
        </div>
        <p className="text-slate-400 text-sm mb-6">Please tap 'Answer' to provide more details so we can complete your triage.</p>
        <button className="btn-primary w-full" onClick={onReset}>
          Answer (Voice)
        </button>
      </div>
    );
  }

  const urgencyColors = {
    'Emergency': 'border-l-emergency bg-emergency/10',
    'Urgent': 'border-l-urgent bg-urgent/10',
    'Routine': 'border-l-routine bg-routine/10'
  };

  const badgeColors = {
    'Emergency': 'bg-emergency text-white',
    'Urgent': 'bg-urgent text-white',
    'Routine': 'bg-routine text-white'
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl gap-6 animate-[fadeSlideIn_0.5s_ease]">
      
      <div className={`w-full glass-card border-l-4 ${urgencyColors[result.urgency]} overflow-hidden`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColors[result.urgency]}`}>
              {result.urgency}
            </span>
            <span className="text-slate-400 text-sm">Recommended Action</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{result.next_step || 'Consult a healthcare provider for further guidance.'}</h2>
          <p className="text-lg text-slate-300 leading-relaxed">{result.explanation || 'No detailed explanation provided by the triage engine.'}</p>
        </div>
      </div>

      {result.key_factors && result.key_factors.length > 0 && (
        <div className="w-full glass-card p-6">
          <button 
            className="w-full flex justify-between items-center text-left"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <span className="font-semibold text-slate-200">Why this result? (Explainability)</span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showExplanation ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showExplanation && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-sm text-slate-400 mb-3">The AI weighted these factors most heavily:</p>
              <ul className="list-disc pl-5 text-slate-300 space-y-1">
                {result.key_factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {facilities.length > 0 && (
        <div className="w-full glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Suggested Nearest Facilities:</h3>
          <div className="flex flex-col gap-3">
            {facilities.map(f => (
              <div key={f.id} className="bg-navy-900 border border-slate-700/50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-mint">{f.name}</h4>
                  <p className="text-sm text-slate-400">{f.type} • {f.hours}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-200">{f.distance_miles}</span>
                  <span className="text-xs text-slate-500 ml-1">mi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 w-full mt-4">
        <button className="btn-secondary flex-1" onClick={onReset}>
          New Session
        </button>
        <button className="btn-primary flex-1" onClick={() => window.print()}>
          Download Summary
        </button>
      </div>

    </div>
  );
};

export default TriageResult;
