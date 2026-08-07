const crypto = require('crypto');

// In-memory store (for hackathon demo)
const sessions = new Map();

const createSession = () => {
  // Generate a random 6 char ID for simplicity
  const id = Math.random().toString(36).substring(2, 8).toUpperCase();
  sessions.set(id, {
    id,
    created_at: new Date().toISOString(),
    vitals: null,
    symptoms: null,
    triage_result: null,
    followup_history: []
  });
  return id;
};

const getSession = (id) => {
  return sessions.get(id);
};

const updateVitals = (id, vitals) => {
  const session = sessions.get(id);
  if (session) {
    session.vitals = vitals;
    sessions.set(id, session);
  }
};

const updateSymptoms = (id, symptoms) => {
  const session = sessions.get(id);
  if (session) {
    session.symptoms = symptoms;
    sessions.set(id, session);
  }
};

const addFollowUpAnswer = (id, answer) => {
  const session = sessions.get(id);
  if (session) {
    session.followup_history.push({ role: 'user', content: answer });
    sessions.set(id, session);
  }
};

const updateTriageResult = (id, result) => {
  const session = sessions.get(id);
  if (session) {
    session.triage_result = result;
    // If there was a followup question, record it in history
    if (result.needs_followup && result.followup_question) {
      session.followup_history.push({ role: 'assistant', content: result.followup_question });
    }
    sessions.set(id, session);
  }
};

module.exports = {
  createSession,
  getSession,
  updateVitals,
  updateSymptoms,
  addFollowUpAnswer,
  updateTriageResult
};
