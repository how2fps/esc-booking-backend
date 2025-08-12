import express, { RequestHandler} from "express";
import { createBooking } from "../controllers/bookingController";

const router = express.Router();

router.post("/", createBooking as RequestHandler);

export default router;
