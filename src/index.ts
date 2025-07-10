import dotenv from "dotenv";
import express from "express";
import { testConnection } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
       res.send("This workzzzs");
});

app.listen(PORT, () => {
       testConnection();
       console.log(`Server runningz on http://localhost:${PORT}`);
});
