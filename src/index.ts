import dotenv from "dotenv";
import express from "express";
import { testConnection } from "./db";
import userRoutes from "./routes/userRoutes";

dotenv.config({ path: ".env.dev" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRoutes);
app.get("/", (_req, res) => {
       res.send("This workzzszs");
});

app.listen(PORT, () => {
       testConnection();
       console.log(`Server runningzs on http://localhost:${PORT}`);
});
