import express from "express";
import { getAllHotels, pollAllHotelPrices, getHotelById } from "../controllers/hotelController";

const router = express.Router();

router.get("/", getAllHotels);
router.get("/prices", pollAllHotelPrices);
router.get("/:id", getHotelById);
export default router;
