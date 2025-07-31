import express from "express";
import { getSearchResult } from "../controllers/destinationController";

const router = express.Router();

router.get("/:term", getSearchResult);
export default router;
