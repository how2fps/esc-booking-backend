import Stripe from 'stripe';
import express from 'express';
import cors from 'cors';
const app = express();
app.use(cors());
const stripe = new Stripe('sk_test_51RlnqCFyaklkAMXy3bGjZAbtqwV5YTo1XMzIOv6UBE4zyixDyJx7zM0L1zUDMuw3LSV5K4d14RmmMdVfZ0URPMbT00DeV4VJS3');
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://127.0.0.1:5173';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    
    ui_mode: 'embedded',
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        price: 'price_1RoeoAFyaklkAMXyQ73FxwdC',
        quantity: 1,
      },
    ],
    mode: 'payment',
    return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  res.send({clientSecret: session.client_secret});
});

app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email
  });
});

app.listen(4242, () => console.log('Running on port 4242'));