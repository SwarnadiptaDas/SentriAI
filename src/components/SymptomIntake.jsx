import React, { useState, useEffect, useRef } from 'react';
import './SymptomIntake.css';

function SymptomIntake({ onSubmit }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setTranscript((prev) => prev + (prev ? ' ' : '') + final);
        }
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
          setError(event.error);
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };
    } else {
      setSpeechSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const toggleListening = () => {
    setError(null);
    setIsListening(!isListening);
  };

  const handleManualEdit = (e) => {
    setTranscript(e.target.value);
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      if (isListening) setIsListening(false);
      onSubmit(transcript.trim());
    }
  };

  return (
    <div className="symptom-intake">
      <h2>Symptom Dictation</h2>
      <p className="subtitle">
        {speechSupported ? "Tap the microphone to dictate your symptoms" : "Please type your symptoms below"}
      </p>

      {speechSupported && (
        <div className="mic-container">
          {isListening && (
            <>
              <div className="mic-ring ring-1"></div>
              <div className="mic-ring ring-2"></div>
            </>
          )}
          <button 
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
        </div>
      )}

      {isListening && (
        <div className="listening-indicator">
          <span>Recording</span>
          <span className="dot dot-1">.</span>
          <span className="dot dot-2">.</span>
          <span className="dot dot-3">.</span>
        </div>
      )}

      {error && <div className="error-text">Error: {error}</div>}

      <div className="transcript-card">
        <div className="transcript-header">Clinical Notes</div>
        <div className="transcript-area">
          {speechSupported ? (
            <>
              <span>{transcript}</span>
              <span className="interim-text">{interimTranscript}</span>
              {!transcript && !interimTranscript && !isListening && (
                <span className="placeholder-text">Waiting for dictation...</span>
              )}
            </>
          ) : (
            <textarea 
              className="transcript-fallback" 
              value={transcript}
              onChange={handleManualEdit}
              placeholder="Type your symptoms here..."
              rows="6"
            />
          )}
        </div>
        <div className="char-count">
          {transcript.length} chars
        </div>
      </div>

      <button 
        className="submit-btn" 
        onClick={handleSubmit}
        disabled={!transcript.trim()}
      >
        Submit to Chart
      </button>
    </div>
  );
}

export default SymptomIntake;
