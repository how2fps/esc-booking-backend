import express, { RequestHandler} from "express";
import { createBooking, confirmBookingPayment } from "../controllers/bookingController";

const router = express.Router();

router.post("/", createBooking as RequestHandler);
router.post("/confirm-payment", confirmBookingPayment as RequestHandler);

export default router;
