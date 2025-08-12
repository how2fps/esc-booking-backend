import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import cron from "node-cron";
import { testConnection } from "./db";
import bookingRoutes from "./routes/bookingRoutes";
import hotelRoutes from "./routes/hotelRoutes";
import searchRoutes from "./routes/searchRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import userRoutes from "./routes/userRoutes";

import db from "./db";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.dev";

dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3000;

const cleanupPendingBookings = async () => {
       console.log("Running cleanup for pending bookings...");
       const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2h ago
       const sqlQuery = "DELETE FROM `bookings` WHERE `payment_status` = 'pending' AND `created_at` < ?";
       try {
              const [result] = await db.execute(sqlQuery, [cutoff]);
              const deletedCount = (result as any).affectedRows;

              if (deletedCount > 0) {
                     console.log(`✅ Successfully deleted ${deletedCount} abandoned bookings.`);
              } else {
                     console.log("No abandoned bookings to delete.");
              }
       } catch (error) {
              console.error("Error during booking cleanup:", error);
       }
};

cron.schedule("0 * * * *", () => {
       console.log("Triggering hourly cleanup task...");
       cleanupPendingBookings();
});

app.use(express.json());
app.use(
       cors({
              origin: ["http://localhost:5173", "http://54.255.23.219:8080", "https://54.255.23.219:8080"],
              credentials: true,
       })
);
app.use(
       session({
              secret: "8237128eu12",
              resave: false,
              saveUninitialized: false,
              cookie: {
                     maxAge: 1800000,
                     httpOnly: true,
                     secure: true,
                     sameSite: "none",
              },
       })
);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/search", searchRoutes);
app.get("/", (_req, res) => {
       res.send("Server running");
});

const startServer = async () => {
       try {
              await testConnection();
              app.listen(PORT, () => {
                     console.log(`Server running on http://localhost:${PORT}`);
              });
       } catch (error) {
              console.error("Failed to connect to database and start server:", error);
              process.exit(1);
       }
};
startServer();
