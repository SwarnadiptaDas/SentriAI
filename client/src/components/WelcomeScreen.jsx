import React from 'react';

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center p-12 max-w-lg w-full gap-8 animate-[fadeSlideIn_0.6s_ease]">
      <div className="animate-[floatGentle_4s_ease-in-out_infinite] mb-2">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#5EEAD4" fillOpacity="0.15"/>
          <path d="M40 18C38.5 18 37.2 18.6 36.3 19.5L36 19.8C35.1 20.7 34.5 22 34.5 23.5V34.5H23.5C22 34.5 20.7 35.1 19.8 36L19.5 36.3C18.6 37.2 18 38.5 18 40C18 41.5 18.6 42.8 19.5 43.7L19.8 44C20.7 44.9 22 45.5 23.5 45.5H34.5V56.5C34.5 58 35.1 59.3 36 60.2L36.3 60.5C37.2 61.4 38.5 62 40 62C41.5 62 42.8 61.4 43.7 60.5L44 60.2C44.9 59.3 45.5 58 45.5 56.5V45.5H56.5C58 45.5 59.3 44.9 60.2 44L60.5 43.7C61.4 42.8 62 41.5 62 40C62 38.5 61.4 37.2 60.5 36.3L60.2 36C59.3 35.1 58 34.5 56.5 34.5H45.5V23.5C45.5 22 44.9 20.7 44 19.8L43.7 19.5C42.8 18.6 41.5 18 40 18Z" fill="#5EEAD4"/>
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Sentri</h1>
        <p className="text-slate-400 text-lg">Contactless AI Health Triage</p>
      </div>

      <div className="flex flex-col gap-4 w-full text-left bg-navy-900/50 p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="bg-mint/10 p-3 rounded-xl text-mint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">Step 1: Scan</h3>
            <p className="text-slate-400 text-sm">Contactless vitals extraction</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-mint/10 p-3 rounded-xl text-mint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">Step 2: Speak</h3>
            <p className="text-slate-400 text-sm">Voice symptom intake</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-mint/10 p-3 rounded-xl text-mint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div>
            <h3 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">Step 3: Triage</h3>
            <p className="text-slate-400 text-sm">AI severity classification</p>
          </div>
        </div>
      </div>

      <button className="btn-primary w-full text-lg mt-2" onClick={onStart}>
        Start Session
      </button>

      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        ⚠️ Decision-support prototype, not a certified medical device. Always consult a healthcare professional.
      </p>
    </div>
  );
};

export default WelcomeScreen;
