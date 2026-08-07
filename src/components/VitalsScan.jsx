import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import Waveform from './Waveform';
import { estimateHeartRate, estimateBreathingRate } from '../utils/signalProcessing';
import './VitalsScan.css';

const VitalsScan = ({ onComplete }) => {
  const [state, setState] = useState('loading'); // loading, ready, scanning, processing, complete, error
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [vitals, setVitals] = useState({ heartRate: null, breathingRate: null });
  const [signalData, setSignalData] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [signalQuality, setSignalQuality] = useState('good');
  
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isComponentMounted = useRef(true);
  
  const scanStartTimeRef = useRef(0);
  const signalBufferRef = useRef([]);
  const timestampsRef = useRef([]);
  const SCAN_DURATION = 15000;
  const isScanningRef = useRef(false);

  useEffect(() => {
    isComponentMounted.current = true;
    
    const initScanner = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1
        });
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        if (!isComponentMounted.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              
              if (overlayRef.current) {
                overlayRef.current.width = videoRef.current.videoWidth;
                overlayRef.current.height = videoRef.current.videoHeight;
              }
              if (hiddenCanvasRef.current) {
                hiddenCanvasRef.current.width = videoRef.current.videoWidth;
                hiddenCanvasRef.current.height = videoRef.current.videoHeight;
              }
              
              setState('ready');
              startDetectionLoop();
            }
          };
        }
      } catch (err) {
        console.error("Initialization error:", err);
        if (isComponentMounted.current) {
          setState('error');
          setErrorMessage("Failed to access camera or load detection models. Please ensure camera permissions are granted.");
        }
      }
    };
    
    initScanner();
    
    return () => {
      isComponentMounted.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  const startDetectionLoop = useCallback(() => {
    let lastVideoTime = -1;
    
    const tick = () => {
      if (!isComponentMounted.current) return;
      if (state === 'error' || state === 'complete') {
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      
      const video = videoRef.current;
      const overlay = overlayRef.current;
      const hiddenCanvas = hiddenCanvasRef.current;
      const landmarker = faceLandmarkerRef.current;
      
      if (video && overlay && hiddenCanvas && landmarker && video.readyState >= 2) {
        const startTimeMs = performance.now();
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const results = landmarker.detectForVideo(video, startTimeMs);
          
          const ctx = overlay.getContext('2d');
          ctx.clearRect(0, 0, overlay.width, overlay.height);
          
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            setFaceDetected(true);
            const landmarks = results.faceLandmarks[0];
            
            const w = overlay.width;
            const h = overlay.height;
            
            let minX = w, minY = h, maxX = 0, maxY = 0;
            landmarks.forEach(lm => {
              const x = lm.x * w;
              const y = lm.y * h;
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            });
            
            const faceWidth = maxX - minX;
            const faceHeight = maxY - minY;
            
            const roiX = minX + faceWidth * 0.3;
            const roiY = minY + faceHeight * 0.05;
            const roiW = faceWidth * 0.4;
            const roiH = faceHeight * 0.15;
            
            ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.rect(roiX, roiY, roiW, roiH);
            ctx.fill();
            ctx.stroke();
            
            if (isScanningRef.current) {
              const hCtx = hiddenCanvas.getContext('2d');
              hCtx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
              
              if (roiW > 0 && roiH > 0 && roiX >= 0 && roiY >= 0 && (roiX+roiW) <= w && (roiY+roiH) <= h) {
                const imageData = hCtx.getImageData(roiX, roiY, roiW, roiH);
                const data = imageData.data;
                let greenSum = 0;
                let pixelCount = data.length / 4;
                
                for (let i = 0; i < data.length; i += 4) {
                  greenSum += data[i + 1];
                }
                
                const avgGreen = greenSum / pixelCount;
                signalBufferRef.current.push(avgGreen);
                timestampsRef.current.push(startTimeMs);
                
                if (signalBufferRef.current.length % 5 === 0) {
                  setSignalData([...signalBufferRef.current]);
                  
                  // Simple signal quality heuristic
                  if (signalBufferRef.current.length > 30) {
                    const recent = signalBufferRef.current.slice(-30);
                    const variance = recent.reduce((a, b) => a + Math.pow(b - avgGreen, 2), 0) / recent.length;
                    if (variance > 100) setSignalQuality('poor');
                    else if (variance > 50) setSignalQuality('fair');
                    else setSignalQuality('good');
                  }
                }
              }
            }
          } else {
            setFaceDetected(false);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.ellipse(overlay.width / 2, overlay.height / 2, overlay.width * 0.25, overlay.height * 0.35, 0, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        
        if (isScanningRef.current) {
          const elapsed = performance.now() - scanStartTimeRef.current;
          const prog = Math.min((elapsed / SCAN_DURATION) * 100, 100);
          setProgress(prog);
          
          if (elapsed >= SCAN_DURATION) {
            isScanningRef.current = false;
            finishScan();
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [state]);

  const startScan = () => {
    if (!faceDetected) return;
    setState('scanning');
    isScanningRef.current = true;
    scanStartTimeRef.current = performance.now();
    signalBufferRef.current = [];
    timestampsRef.current = [];
    setSignalData([]);
    setProgress(0);
    setSignalQuality('good');
  };

  const finishScan = () => {
    setState('processing');
    
    setTimeout(() => {
      try {
        const signal = signalBufferRef.current;
        const timestamps = timestampsRef.current;
        
        if (signal.length < 100) {
          throw new Error("Not enough data collected");
        }
        
        const numFrames = signal.length;
        const durationMs = timestamps[timestamps.length - 1] - timestamps[0];
        const sampleRate = (numFrames - 1) / durationMs * 1000;
        
        const hrResult = estimateHeartRate(signal, sampleRate);
        const brResult = estimateBreathingRate(signal, sampleRate);
        
        if (hrResult.confidence < 0.3) {
          throw new Error("Signal quality too low");
        }
        
        setVitals({
          heartRate: Math.round(hrResult.bpm),
          breathingRate: brResult.confidence > 0.3 ? Math.round(brResult.rate) : null
        });
        setState('complete');
      } catch (err) {
        console.error("Processing error:", err);
        setState('error');
        setErrorMessage("Could not get a clear reading. Please ensure good lighting and hold still.");
      }
    }, 1000);
  };
  
  const resetScan = () => {
    setState('ready');
    setErrorMessage('');
    setProgress(0);
    setSignalData([]);
  };

  const handleComplete = () => {
    onComplete(vitals);
  };

  return (
    <div className="vitals-scan">
      <div className="scan-header">
        <h2>Vitals Scan</h2>
        <p className="scan-subtitle">
          {state === 'loading' && "Initializing secure camera..."}
          {state === 'ready' && "Position your face in the center and hold still"}
          {state === 'scanning' && "Hold still... analyzing micro-variations"}
          {state === 'processing' && "Processing signal data..."}
          {state === 'complete' && "Scan successful"}
          {state === 'error' && "Scan failed"}
        </p>
      </div>

      <div className={`camera-container ${state === 'scanning' ? 'is-scanning' : ''}`}>
        <video 
          ref={videoRef} 
          className="camera-feed"
          playsInline 
          muted
        />
        <canvas 
          ref={overlayRef} 
          className="camera-overlay"
        />
        <canvas 
          ref={hiddenCanvasRef} 
          style={{ display: 'none' }}
        />
        
        {state === 'scanning' && (
          <div className="scanning-ring"></div>
        )}
        
        {state === 'ready' && faceDetected && (
          <button className="start-scan-btn" onClick={startScan}>
            Start Scan
          </button>
        )}
      </div>

      {state === 'scanning' && (
        <div className="scan-progress-container">
          <div className="scan-progress-wrapper" style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div className="scan-progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
          </div>
          <div className="signal-quality-indicator">
            <span className={`quality-dot ${signalQuality}`}></span>
            Signal Quality: {signalQuality.charAt(0).toUpperCase() + signalQuality.slice(1)}
          </div>
          <div className="waveform-container">
            <Waveform data={signalData} width={500} height={120} />
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <p>Analyzing signal algorithms...</p>
        </div>
      )}

      {state === 'complete' && (
        <div className="vitals-result-container">
          <div className="vitals-result-card">
            <div className="vital-item">
              <span className="vital-label">Heart Rate</span>
              <div className="vital-value-group">
                <span className="heart-icon pulse-animation">❤️</span>
                <span className="bpm-number">{vitals.heartRate}</span>
                <span className="vital-unit">BPM</span>
              </div>
            </div>
            
            {vitals.breathingRate && (
              <div className="vital-item">
                <span className="vital-label">Breathing Rate</span>
                <div className="vital-value-group">
                  <span className="breath-icon">💨</span>
                  <span className="bpm-number secondary">{vitals.breathingRate}</span>
                  <span className="vital-unit">RPM</span>
                </div>
              </div>
            )}
          </div>
          
          <button className="continue-btn" onClick={handleComplete}>
            Continue to Symptom Check
          </button>
        </div>
      )}

      {state === 'error' && (
        <div className="error-state">
          <p className="error-message">⚠️ {errorMessage}</p>
          <button className="retry-btn" onClick={resetScan}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default VitalsScan;
