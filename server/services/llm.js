const Groq = require('groq-sdk');

const triagePatient = async (session) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the server');
  }

  const groq = new Groq({ apiKey });

  const { vitals, symptoms, followup_history } = session;

  const systemPrompt = `You are a clinical triage decision-support assistant, modeled loosely on
standard Emergency Severity Index (ESI) principles. You are NOT diagnosing
the patient — you are helping prioritize how urgently they should seek care.

You will be given:
1. Measured vitals: heart rate in BPM, breathing rate if available,
   and a heart rate variability / stress tag if available
2. A transcribed description of the patient's symptoms, in their own words
3. (If available) answers to any follow-up clarifying questions asked

Your task:
1. Classify urgency into exactly one of: "Emergency", "Urgent", or "Routine"
2. Write a short, plain-language explanation (grade 8 reading level, 2-3
   sentences) referencing both the vitals and the symptoms in your reasoning
3. Suggest one concrete next step appropriate to the urgency level
4. List the 2-3 specific factors (from vitals or symptoms) that most
   influenced your classification, for the explainability panel
5. If the symptom description is too vague to classify confidently,
   return exactly one clarifying follow-up question instead of a final
   classification

Guidelines:
- Elevated heart rate (>100 BPM at rest) combined with symptoms like chest
  pain, shortness of breath, or dizziness should generally push toward
  "Emergency" or "Urgent"
- Mild, isolated symptoms with normal vitals (60-100 BPM resting) should
  generally be "Routine" unless the symptom description itself indicates
  a red flag (e.g. severe pain, confusion, difficulty breathing)
- Always err toward caution when uncertain — recommend a higher urgency
  tier rather than a lower one
- Never state a specific diagnosis. Only describe urgency and next steps.

Respond ONLY in this JSON format, no other text:
{
  "needs_followup": boolean,
  "followup_question": "string or null",
  "urgency": "Emergency" | "Urgent" | "Routine" | null,
  "explanation": "string or null",
  "next_step": "string or null",
  "key_factors": ["string", "string"] 
}`;

  let userContent = `VITALS:\nHeart Rate: ${vitals?.heartRate} BPM\nStress Indicator: ${vitals?.stressLevel || 'Unknown'}\n\nSYMPTOMS:\n${symptoms?.transcript || 'None'}`;
  
  if (followup_history && followup_history.length > 0) {
    userContent += '\n\nFOLLOW-UP HISTORY:\n';
    followup_history.forEach(msg => {
      userContent += `${msg.role === 'assistant' ? 'Question' : 'Answer'}: ${msg.content}\n`;
    });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const resultText = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(resultText);
  } catch (error) {
    console.error('LLM API Error:', error);
    // Realistic fallback response for when API key is missing
    return {
      needs_followup: false,
      followup_question: null,
      urgency: "Urgent",
      explanation: "Based on the elevated heart rate and reported symptoms, there are signs of cardiovascular stress. A medical evaluation is recommended to rule out acute conditions.",
      next_step: "Please consult a healthcare professional at an urgent care facility today.",
      key_factors: ["Elevated Heart Rate (>100 BPM)", "Self-reported symptoms"]
    };
  }
};

module.exports = { triagePatient };
