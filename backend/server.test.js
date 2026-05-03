const request = require('supertest');
const app = require('./server');

// Mock Google Auth
jest.mock('google-auth-library', () => {
  return {
    GoogleAuth: jest.fn().mockImplementation(() => ({
      getClient: jest.fn().mockResolvedValue({
        getAccessToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
      }),
    })),
  };
});

// Mock global fetch
global.fetch = jest.fn();

describe('Dialogflow Proxy Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Health Check
  test('GET /api/health returns 200 and project info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('project');
  });

  // Test 2: Missing Body Fields
  test('POST /api/dialogflow returns 400 if text is missing', async () => {
    const res = await request(app)
      .post('/api/dialogflow')
      .send({ sessionId: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  // Test 3: Missing Session ID
  test('POST /api/dialogflow returns 400 if sessionId is missing', async () => {
    const res = await request(app)
      .post('/api/dialogflow')
      .send({ text: 'hello' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/Missing required fields/);
  });

  // Test 4: Successful Proxy Request
  test('POST /api/dialogflow successfully proxies a request', async () => {
    const mockDialogflowResponse = {
      queryResult: { fulfillmentText: 'Hello from mock!' },
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDialogflowResponse,
    });

    const res = await request(app)
      .post('/api/dialogflow')
      .send({ text: 'hi', sessionId: 'test-session' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockDialogflowResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('detectIntent'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'x-goog-user-project': expect.any(String),
        }),
      })
    );
  });

  // Test 5: Handling 404 (Your Current Error)
  test('POST /api/dialogflow handles 404 Not Found from Dialogflow', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: 'No DesignTimeAgent found' } }),
    });

    const res = await request(app)
      .post('/api/dialogflow')
      .send({ text: 'hi', sessionId: 'test-session' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Dialogflow request failed');
  });

  // Test 6: Handling 403 Forbidden
  test('POST /api/dialogflow handles 403 Forbidden from Dialogflow', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'Permission Denied' } }),
    });

    const res = await request(app)
      .post('/api/dialogflow')
      .send({ text: 'hi', sessionId: 'test-session' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Dialogflow request failed');
  });

  // Test 7: Handling 500 Internal Server Error from Dialogflow
  test('POST /api/dialogflow handles 500 from Dialogflow', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Internal Server Error' } }),
    });

    const res = await request(app)
      .post('/api/dialogflow')
      .send({ text: 'hi', sessionId: 'test-session' });

    expect(res.statusCode).toBe(500);
  });

  // Test 8: CORS Headers presence
  test('Server includes CORS headers in response', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:4200');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
  });

  // Test 9: Invalid JSON payload
  test('POST /api/dialogflow returns 400 for invalid JSON', async () => {
    const res = await request(app)
      .post('/api/dialogflow')
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}');
    expect(res.statusCode).toBe(400);
  });

  // Test 10: Non-existent route
  test('Returns 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/non-existent');
    expect(res.statusCode).toBe(404);
  });

  // Test 11: Large Payload
  test('POST /api/dialogflow handles larger text inputs', async () => {
    const largeText = 'a'.repeat(1000);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ queryResult: { fulfillmentText: 'Got it' } }),
    });

    const res = await request(app)
      .post('/api/dialogflow')
      .send({ text: largeText, sessionId: 'test-session' });

    expect(res.statusCode).toBe(200);
  });
});
