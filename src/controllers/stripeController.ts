import { Request, Response } from 'express';
import Stripe from 'stripe';
import db from '../db'; // 1. Import your mysql2 connection pool
import { RowDataPacket } from 'mysql2'; // 2. Import the type for database rows

const stripe = new Stripe('sk_test_51RlnqCFyaklkAMXy3bGjZAbtqwV5YTo1XMzIOv6UBE4zyixDyJx7zM0L1zUDMuw3LSV5K4d14RmmMdVfZ0URPMbT00DeV4VJS3');

// 3. Define a type for the data you expect from your 'bookings' table
interface Booking extends RowDataPacket {
  id: number;
  price: number;
  hotel_name: string;
  room_type: string;
}

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  // 4. Get the bookingId from the request body
  const { bookingId } = req.body;

  if (!bookingId) {
    res.status(400).send({ error: { message: 'Booking ID is required.' } });
    return;
  }

  try {
    // 5. Fetch the booking details from your MySQL database
    const sqlQuery = "SELECT * FROM `bookings` WHERE `id` = ?";
    const [rows] = await db.execute<Booking[]>(sqlQuery, [bookingId]);
    const booking = rows[0];

    if (!booking) {
      res.status(404).send({ error: { message: 'Booking not found.' } });
      return;
    }

    // 6. Convert the price from dollars to cents for Stripe
    const priceInCents = Math.round(booking.price * 100);

    if (priceInCents <= 0) {
      res.status(400).send({ error: { message: 'Price must be greater than zero.' } });
      return;
    }

    // 7. Use the fetched data to create the Stripe session
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: priceInCents, // Use the price from the database
            product_data: {
              name: `Booking at ${booking.hotel_name}`, // Use the hotel name from the database
              description: `Room: ${booking.room_type}`, // Use the room type from the database
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // 8. Pass your bookingId in the metadata for your webhook
      metadata: {
        bookingId: booking.id,
      },
      return_url: `http://localhost:5173/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.send({ clientSecret: session.client_secret });
  } catch (error: any) {
    res.status(500).send({ error: { message: error.message } });
  }
};

export const getSessionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionId = req.query.session_id as string;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.send({
      status: session.status,
      customer_email: session.customer_details?.email
    });
  } catch (error: any) {
    res.status(400).send({ error: { message: error.message } });
  }
};