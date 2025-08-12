import express from "express";
import { getAllHotels, getHotelById, getHotelPrices } from "../controllers/hotelController";

const router = express.Router();

router.get("/", getAllHotels);
// router.get("/prices", pollAllHotelPrices);
router.get("/:id", getHotelById);
router.get("/:id/prices", getHotelPrices);
export default router;
