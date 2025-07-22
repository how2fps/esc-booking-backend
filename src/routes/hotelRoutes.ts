import express from "express";
import { getAllHotels, pollAllHotelPrices } from "../controllers/hotelController";

const router = express.Router();

router.get("/", getAllHotels);
router.get("/prices", pollAllHotelPrices);
export default router;
