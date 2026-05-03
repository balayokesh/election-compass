const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const { GoogleAuth } = require('google-auth-library');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID || 'inlaid-computer-463215-p9';
const LANGUAGE_CODE = process.env.DIALOGFLOW_LANGUAGE_CODE || 'en';
const REGION = process.env.DIALOGFLOW_REGION || 'global';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const REQUIRE_AUTH = process.env.REQUIRE_AUTH
  ? process.env.REQUIRE_AUTH === 'true'
  : IS_PRODUCTION;
const MAX_TEXT_LENGTH = Number(process.env.MAX_QUERY_TEXT_LENGTH || 2000);
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

// ---------------------------------------------------------------------------
// Google Auth — uses Application Default Credentials (ADC)
// ---------------------------------------------------------------------------
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/dialogflow'],
  projectId: PROJECT_ID, // Explicitly set the project ID
});

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

const corsAllowList = new Set([
  'http://localhost:4200',
  'http://localhost:4300',
  'https://election-compass-frontend-71290505890.us-central1.run.app',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsAllowList.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS origin denied'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

app.use(express.json({ limit: '16kb' }));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

if (!admin.apps.length) {
  admin.initializeApp();
}

async function requireAuth(req, res, next) {
  if (!REQUIRE_AUTH) {
    return next();
  }

  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const idToken = authorization.slice('Bearer '.length).trim();
  if (!idToken) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    req.user = await admin.auth().verifyIdToken(idToken, true);
    return next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error?.message || error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/dialogflow
// Body: { text: string, sessionId: string }
// Returns: Dialogflow detectIntent response JSON
// ---------------------------------------------------------------------------
app.post('/api/dialogflow', requireAuth, async (req, res) => {
  try {
    const { text, sessionId } = req.body;

    if (!text || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields: text, sessionId' });
    }

    if (typeof text !== 'string' || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'text and sessionId must be strings' });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return res.status(400).json({ error: 'text must not be empty' });
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return res
        .status(400)
        .json({ error: `text exceeds maximum length of ${MAX_TEXT_LENGTH}` });
    }

    if (!SESSION_ID_PATTERN.test(sessionId)) {
      return res.status(400).json({ error: 'sessionId format is invalid' });
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
            text: trimmedText,
            languageCode: LANGUAGE_CODE,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('[Proxy] Dialogflow error:', response.status, errorBody);
      return res.status(response.status).json({
        error: 'Dialogflow request failed',
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('[Proxy] Internal error:', err);
    return res.status(500).json({ error: 'Internal proxy error' });
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
