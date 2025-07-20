import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { testConnection } from "./db";
import userRoutes from "./routes/userRoutes";

dotenv.config({ path: ".env.dev" });

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
app.get("/", (_req, res) => {
       res.send("This workzzszs");
});

app.listen(PORT, () => {
       testConnection();
       console.log(`Server runningzs on http://localhost:${PORT}`);
});
