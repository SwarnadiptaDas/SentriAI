const express = require('express');
const router = express.Router();
const sessionStore = require('../services/sessionStore');
const { triagePatient } = require('../services/llm');

// POST /api/session/:id/triage
router.post('/:id/triage', async (req, res) => {
  const { id } = req.params;
  const session = sessionStore.getSession(id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Optional followup answer provided by client
  if (req.body.followup_answer) {
    sessionStore.addFollowUpAnswer(id, req.body.followup_answer);
  }

  try {
    const result = await triagePatient(session);
    
    // Save result to session
    sessionStore.updateTriageResult(id, result);
    
    res.json(result);
  } catch (error) {
    console.error('Triage error:', error);
    res.status(500).json({ error: 'Failed to generate triage result' });
  }
});

module.exports = router;
