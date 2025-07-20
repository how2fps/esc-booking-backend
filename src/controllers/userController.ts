import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../db";

declare module "express-session" {
       interface SessionData {
              userId?: number;
              userName?: string;
              userEmail?: string;
       }
}

export const getAllUsers = async (req: Request, res: Response) => {
       try {
              const [rows] = await db.execute("SELECT id, name, email, created_at FROM users");
              res.status(200).json({
                     success: true,
                     data: rows,
              });
       } catch (error) {
              console.error("Error getAllUsers:", error);
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
              console.error("Error getUserById:", error);
              res.status(500).json({
                     success: false,
                     message: "Error fetching user by ID",
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
              console.error("Error getUserByEmail:", error);
              res.status(500).json({
                     success: false,
                     message: "Error fetching user by email",
              });
       }
};

export const signUp = async (req: Request, res: Response) => {
       try {
              const { name, email, password, phone_number } = req.body;
              const hashedPassword = await bcrypt.hash(password, 10);

              const [result] = (await db.execute("INSERT INTO users (name, email, password, phone_number, loyalty_points) VALUES (?, ?, ?, ?, ?)", [name, email, hashedPassword, phone_number, 0])) as [ResultSetHeader, any];
              res.status(201).json({
                     success: true,
                     data: { id: result.insertId, name, email, phone_number, loyalty_points: 0 },
              });
       } catch (error: any) {
              if (error.code === "ER_DUP_ENTRY") {
                     res.status(409).json({
                            success: false,
                            message: "Email already in use",
                     });
              } else {
                     console.error("Error signUp:", error);
                     res.status(500).json({
                            success: false,
                            message: "Error signing up",
                     });
              }
       }
};

export const login = async (req: Request, res: Response) => {
       try {
              const { email, password } = req.body;
              if (!email || !password || email.trim() === "" || password.trim() === "") {
                     res.status(400).json({
                            success: false,
                            message: "Email and password are required",
                     });
                     return
              }

              const [rows] = await db.execute<RowDataPacket[]>("SELECT id, name, email, password FROM users WHERE email = ?", [email]);

              if (rows.length === 0) {
                     res.status(401).json({
                            success: false,
                            message: "Invalid email or password",
                     });
                     return;
              }
              const user = rows[0];
              const isValidPassword = await bcrypt.compare(password, user.password);
              if (!isValidPassword) {
                     res.status(401).json({
                            success: false,
                            message: "Invalid email or password",
                     });
                     return;
              }

              req.session.userId = user.id;
              req.session.userName = user.name;
              req.session.userEmail = user.email;

              res.status(200).json({
                     success: true,
                     message: "Login successful",
                     data: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                     },
              });
              return;
       } catch (error: any) {
              console.error("Error login:", error);
              res.status(500).json({
                     success: false,
                     message: "Error during login",
              });
       }
};

export const logout = (req: Request, res: Response) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).json({ success: false, message: "Logout failed" });
		}
		res.clearCookie("connect.sid"); // name of the session cookie
		res.status(200).json({ success: true, message: "Logged out" });
	});
};

export const getSessionUser = (req: Request, res: Response): void => {
	try {
		if (!req.session.userId || !req.session.userName || !req.session.userEmail) {
			res.status(401).json({ success: false, message: "Not logged in" });
			return;
		}
		res.status(200).json({
			success: true,
			data: {
				id: req.session.userId,
				name: req.session.userName,
				email: req.session.userEmail,
			},
		});
	} catch (error) {
		console.error("Error getSessionUser:", error);
		res.status(500).json({ success: false, message: "Error getting session user" });
	}
};