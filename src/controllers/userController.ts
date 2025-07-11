import { Request, Response } from "express";
import db from "../db";

export const getAllUsers = async (req: Request, res: Response) => {
       try {
              const [rows] = await db.execute("SELECT id, name, email, created_at FROM users");
              res.status(200).json({
                     success: true,
                     data: rows,
              });
       } catch (error) {
              console.error("Error fetching users:", error);
              res.status(500).json({
                     success: false,
                     message: "Error fetching users",
              });
       }
};

export const getUserById = async (req: Request, res: Response) => {
       try {
              const { id } = req.params;
              const [rows] = await db.execute("SELECT id, name, email, phone_number, loyalty_points, created_at FROM users WHERE id = ?", [id]);
              res.status(200).json({
                     success: true,
                     data: rows,
              });
       } catch (error) {
              console.error("Error fetching users:", error);
              res.status(500).json({
                     success: false,
                     message: "Error fetching users",
              });
       }
};

export const getUserByEmail = async (req: Request, res: Response) => {
       try {
              const { email } = req.params;
              const [rows] = await db.execute("SELECT id, name, email, phone_number, loyalty_points, created_at FROM users WHERE email = ?", [email]);
              res.status(200).json({
                     success: true,
                     data: rows,
              });
       } catch (error) {
              console.error("Error fetching users:", error);
              res.status(500).json({
                     success: false,
                     message: "Error fetching users",
              });
       }
};
