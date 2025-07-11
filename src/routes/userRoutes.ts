import express from "express";
import { getAllUsers, getUserByEmail } from "../controllers/userController";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:email", getUserByEmail);

export default router;
