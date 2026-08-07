import React, { useRef, useEffect } from 'react';

const Waveform = ({
  data = [],
  width = 600,
  height = 200,
  color = '#06b6d4',
  lineWidth = 2.5,
  showGrid = true
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Draw background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, w, h);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i <= 3; i++) {
        const y = (h * i) / 4;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    }
    
    if (!data || data.length === 0) return;
    
    // Find min and max for normalization
    let min = data[0];
    let max = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }
    
    const range = max - min || 1;
    
    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    // Add glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    
    const xStep = w / Math.max(data.length - 1, 1);
    
    // Draw line
    for (let i = 0; i < data.length; i++) {
      const x = i * xStep;
      // Normalize to 0-1, invert so higher values are up, scale to 80% of height, center vertically
      const normalized = (data[i] - min) / range;
      const y = h * 0.9 - (normalized * (h * 0.8));
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Reset shadow for fill
    ctx.shadowBlur = 0;
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, `${color}4D`); // 30% opacity
    gradient.addColorStop(1, `${color}00`); // 0% opacity
    
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
  }, [data, width, height, color, lineWidth, showGrid]);

  return (
    <div style={{
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      background: 'var(--bg-secondary)',
      width: '100%',
      maxWidth: `${width}px`
    }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default Waveform;
