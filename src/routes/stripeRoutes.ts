import { Router } from 'express';
import { createCheckoutSession, getSessionStatus } from '../controllers/stripeController';

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.get('/session-status', getSessionStatus);

export default router;