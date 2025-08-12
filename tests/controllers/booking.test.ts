/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import request from 'supertest';
import bookingRoutes from '../../src/routes/bookingRoutes';

// Mock the DB used by the controller
jest.mock('../../src/db', () => ({
  __esModule: true,
  default: {
    execute: jest.fn(),
  },
}));
import db from '../../src/db';

const app = express();
app.use(express.json());

// Tiny helper middleware to simulate a logged-in session user when needed
app.use((req: any, _res, next) => {
  if (req.headers['x-test-session'] === 'true') {
    req.session = { user: { id: 99 } };
  }
  next();
});

app.use('/api/bookings', bookingRoutes);

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/bookings (route integration)', () => {
  const baseBody = {
    hotelName: 'Test Hotel',
    roomType: 'Deluxe',
    numberOfNights: 2,
    startDate: '2025-08-20',
    endDate: '2025-08-22',
    numAdults: 2,
    numChildren: 0,
    price: 123,
    firstName: 'Ian',
    lastName: 'Varella',
    phoneNumber: '98765432',
    email: 'ian@example.com',
    specialRequests: 'Late check-in',
  };

  it('201 + returns bookingId when body.user_id is provided', async () => {
    (db.execute as jest.Mock).mockResolvedValueOnce([{ insertId: 321 }]);

    const res = await request(app)
      .post('/api/bookings')
      .send({ user_id: 5, ...baseBody })
      .expect(201);

    expect(res.body).toEqual({
      message: 'Booking created successfully',
      bookingId: 321,
    });

    expect(db.execute).toHaveBeenCalledTimes(1);
    const [sql, params] = (db.execute as jest.Mock).mock.calls[0];
    expect(String(sql)).toMatch(/INSERT INTO bookings/i);
    expect(params[0]).toBe(5); // user_id is first param
  });

  it('uses session user when body.user_id is missing', async () => {
    (db.execute as jest.Mock).mockResolvedValueOnce([{ insertId: 777 }]);

    const res = await request(app)
      .post('/api/bookings')
      .set('x-test-session', 'true') // sets req.session.user.id = 99 via our middleware
      .send({ ...baseBody })
      .expect(201);

    expect(res.body.bookingId).toBe(777);
    const [, params] = (db.execute as jest.Mock).mock.calls[0];
    expect(params[0]).toBe(99); // taken from session
  });

  it('400 when neither user_id nor session user present', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...baseBody })
      .expect(400);

    expect(res.body).toEqual({ error: 'user_id is required (temporarily via body)' });
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('500 when DB insert fails', async () => {
    (db.execute as jest.Mock).mockRejectedValueOnce(new Error('db down'));

    const res = await request(app)
      .post('/api/bookings')
      .send({ user_id: 1, ...baseBody })
      .expect(500);

    expect(res.body).toEqual({ error: 'Failed to create booking' });
  });
});
