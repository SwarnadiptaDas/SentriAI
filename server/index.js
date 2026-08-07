const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/session', require('./routes/session'));
app.use('/api/session', require('./routes/triage'));
app.use('/api/facilities', require('./routes/facilities'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sentri API is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
