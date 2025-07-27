import express, { Express } from 'express';
import cors from 'cors';
import stripeRoutes from './routes/stripeRoutes';

const app: Express = express();
const port: number = Number(process.env.PORT) || 4242;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stripe', stripeRoutes);

// Your webhook logic would also be structured similarly

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});