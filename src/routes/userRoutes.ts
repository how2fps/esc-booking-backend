import express from "express";
import { getAllUsers, getUserByEmail, login, signUp } from "../controllers/userController";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:email", getUserByEmail);
router.post("/signup", signUp);
router.post("/login", login);

export default router;