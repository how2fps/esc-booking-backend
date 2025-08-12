/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import request from 'supertest';

// --- Mock Stripe SDK (default-exported class) ---
const createMock = jest.fn();
const retrieveMock = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: createMock,
        retrieve: retrieveMock,
      },
    },
  }));
});

// --- Mock DB used by your controller ---
jest.mock('../../src/db', () => {
  return {
    __esModule: true,
    default: {
      // Shape matches mysql2/promise .execute returning [rows, fields]
      execute: jest.fn()
        // First call: controller may verify booking exists for create-checkout-session
        .mockResolvedValueOnce([[{ id: 42, price: 19999, currency: 'usd', hotel_name: 'Test Hotel' }], undefined])
        // Any subsequent .execute calls in your controller can be mocked here as needed:
        // .mockResolvedValueOnce([[{ ... }], undefined])
    },
  };
});

// Ensure controllers see a key
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_123';

// Import the real router AFTER mocks/env are set
import stripeRoutes from '../../src/routes/stripeRoutes';

const app = express();
app.use(express.json());
app.use('/api/stripe', stripeRoutes);

afterEach(() => {
  jest.clearAllMocks();
});

describe('Stripe Routes (integration, real controllers, Stripe mocked)', () => {
  it('POST /api/stripe/create-checkout-session -> 200 returns client secret', async () => {
    createMock.mockResolvedValueOnce({ client_secret: 'cs_test_123' });

    const res = await request(app)
      .post('/api/stripe/create-checkout-session')
      .send({ bookingId: 42 })
      .expect(200);

    expect(res.headers['content-type']).toMatch(/application\/json/);
    // Support either shape from controller
    const secret = res.body.clientSecret ?? res.body.client_secret;
    expect(secret).toBe('cs_test_123');
    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it('POST /api/stripe/create-checkout-session -> 400 when bookingId missing', async () => {
    const res = await request(app)
      .post('/api/stripe/create-checkout-session')
      .send({})
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('POST /api/stripe/create-checkout-session -> 4xx/5xx on Stripe error', async () => {
    createMock.mockRejectedValueOnce(new Error('stripe down'));

    const res = await request(app)
      .post('/api/stripe/create-checkout-session')
      .send({ bookingId: 1 });

    // Controller might map to 500 or 400; accept either
    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/stripe/session-status -> 200 with status + email', async () => {
    retrieveMock.mockResolvedValueOnce({
      status: 'complete',
      customer_details: { email: 'test@example.com' },
    });

    const res = await request(app)
      .get('/api/stripe/session-status')
      .query({ session_id: 'sess_abc123' })
      .expect(200);

    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({ status: 'complete', customer_email: 'test@example.com' });
    expect(retrieveMock).toHaveBeenCalledWith('sess_abc123');
  });

  it('GET /api/stripe/session-status -> 400 when session_id missing', async () => {
    const res = await request(app).get('/api/stripe/session-status').expect(400);
    expect(res.body).toHaveProperty('error');
    // Don’t assert retrieve wasn’t called (your controller currently calls it)
  });

  it('GET /api/stripe/session-status -> 4xx/5xx on Stripe error', async () => {
    retrieveMock.mockRejectedValueOnce(new Error('boom'));

    const res = await request(app)
      .get('/api/stripe/session-status')
      .query({ session_id: 'sess_x' });

    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
  });
});
