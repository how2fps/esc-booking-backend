import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { testConnection } from "./db";
import bookingRoutes from "./routes/bookingRoutes";
import hotelRoutes from "./routes/hotelRoutes";
import searchRoutes from "./routes/searchRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import userRoutes from "./routes/userRoutes";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.dev";

dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
       cors({
              origin: "http://localhost:5173",
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
                     secure: false,
                     sameSite: "lax",
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

app.listen(PORT, () => {
       testConnection();
       console.log(`Server running on http://localhost:${PORT}`);
});
