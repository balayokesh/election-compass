const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID || 'inlaid-computer-463215-p9';
const LANGUAGE_CODE = process.env.DIALOGFLOW_LANGUAGE_CODE || 'en';
const REGION = process.env.DIALOGFLOW_REGION || 'global';

// ---------------------------------------------------------------------------
// Google Auth — uses Application Default Credentials (ADC)
// ---------------------------------------------------------------------------
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/dialogflow'],
  projectId: PROJECT_ID, // Explicitly set the project ID
});

const app = express();

app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4300'] }));
app.use(express.json());

// ---------------------------------------------------------------------------
// POST /api/dialogflow
// Body: { text: string, sessionId: string }
// Returns: Dialogflow detectIntent response JSON
// ---------------------------------------------------------------------------
app.post('/api/dialogflow', async (req, res) => {
  try {
    const { text, sessionId } = req.body;

    if (!text || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields: text, sessionId' });
    }

    // Build the Dialogflow REST URL
    const base =
      REGION === 'global'
        ? 'https://dialogflow.googleapis.com'
        : `https://${REGION}-dialogflow.googleapis.com`;

    const sessionPath =
      REGION === 'global'
        ? `projects/${PROJECT_ID}/agent/sessions/${sessionId}`
        : `projects/${PROJECT_ID}/locations/${REGION}/agent/sessions/${sessionId}`;

    const url = `${base}/v2/${sessionPath}:detectIntent`;

    // Get an authenticated client from ADC
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Forward request to Dialogflow
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken.token}`,
        'x-goog-user-project': PROJECT_ID, // Force the quota project header
      },
      body: JSON.stringify({
        queryInput: {
          text: {
            text,
            languageCode: LANGUAGE_CODE,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('[Proxy] Dialogflow error:', response.status, errorBody);
      return res.status(response.status).json(errorBody);
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('[Proxy] Internal error:', err);
    return res.status(500).json({ error: 'Internal proxy error', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', project: PROJECT_ID });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Dialogflow proxy running on http://localhost:${PORT}`);
    console.log(`   Project: ${PROJECT_ID}`);
    console.log(`   Region:  ${REGION}`);
  });
}

module.exports = app;
