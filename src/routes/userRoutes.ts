import express from "express";
import { getAllUsers, getUserById, getSessionUser, getUserByEmail, login, logout, signUp, updateProfile, deleteAccount } from "../controllers/userController";

const router = express.Router();

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.get("/users/email/:email", getUserByEmail);
router.get("/session", getSessionUser);
router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.put("/profile", updateProfile);
router.delete("/delete", deleteAccount);
export default router;