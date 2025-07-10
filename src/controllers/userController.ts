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
