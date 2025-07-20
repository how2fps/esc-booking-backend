import express from "express";
import { getAllHotels } from "../controllers/hotelController";

const router = express.Router();

router.get("/", getAllHotels);

export default router;
