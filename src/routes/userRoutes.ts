import express from "express";
import { getAllUsers, getUserByEmail, signUp } from "../controllers/userController";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:email", getUserByEmail);
router.post("/signup", signUp);

export default router;
