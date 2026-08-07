# SentriAI — Contactless AI Health Triage Kiosk

SentriAI is a contactless, full-stack health triage prototype designed to rapidly assess patient urgency using purely remote sensing and conversational AI. 

The system leverages computer vision to extract physiological signals (rPPG) from a standard webcam, captures self-reported symptoms via voice/text, and uses a Large Language Model (LLM) to perform a clinical triage classification.

---

## 🏗 System Architecture

The project has been refactored into a modern, professional monorepo structure with distinct frontend and backend services:

```text
ai-health-kiosk/
├── client/         # React + Vite frontend application
│   ├── src/        
│   │   ├── components/ # Modular UI (VitalsScan, TriageResult, etc.)
│   │   ├── utils/      # Signal processing algorithms (FFT, filtering)
│   │   └── api.js      # Backend integration layer
├── server/         # Node.js + Express backend service
│   ├── routes/     # API endpoints for session & triage management
│   └── services/   # LLM orchestration (Groq API) & in-memory store
```

### 🧠 Core Technologies
*   **Frontend**: React, Vite, Tailwind CSS (v3)
*   **Backend**: Node.js, Express
*   **AI Models**: 
    *   `MediaPipe FaceLandmarker` (Browser-side face tracking)
    *   `Llama 3.1 70B` via Groq (Server-side clinical reasoning)

## ✨ Key Features

1.  **Contactless Vitals Extraction (rPPG)**
    *   Identifies the user's forehead Region of Interest (ROI) dynamically.
    *   Measures light absorption changes in the green channel to extract pulse waves.
    *   Calculates Heart Rate (BPM) and estimates HRV Stress levels via FFT.
2.  **Multimodal Symptom Intake**
    *   Collects patient symptoms in their own words.
3.  **Agentic LLM Triage**
    *   Fuses vitals data + symptom transcript into a structured ESI-style triage assessment.
    *   Classifies urgency into **Emergency**, **Urgent**, or **Routine**.
    *   Provides concrete next steps and explainability ("Why this result?").

---

## 🚀 Getting Started

### 1. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add your Groq API key:
```env
PORT=3001
GROQ_API_KEY=gsk_your_api_key_here
```

Start the backend server:
```bash
node index.js
```

### 2. Setup the Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` to experience SentriAI.

---

## ⚠️ Disclaimer
**This software is a decision-support prototype built for demonstration purposes. It is NOT a certified medical device and should not be used to diagnose or treat actual medical conditions.**
