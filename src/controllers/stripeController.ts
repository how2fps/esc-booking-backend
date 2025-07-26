import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51RlnqCFyaklkAMXy3bGjZAbtqwV5YTo1XMzIOv6UBE4zyixDyJx7zM0L1zUDMuw3LSV5K4d14RmmMdVfZ0URPMbT00DeV4VJS3');

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: 'price_1RoeoAFyaklkAMXyQ73FxwdC',
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `http://localhost:5173/return?session_id={CHECKOUT_SESSION_ID}`,
    });
    res.send({ clientSecret: session.client_secret });
  } catch (error: any) {
    res.status(400).send({ error: { message: error.message } });
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