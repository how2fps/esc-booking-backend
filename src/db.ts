import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: ".env.dev" });

const dbConfig = {
       host: process.env.DB_HOST,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
       port: parseInt(process.env.DB_PORT || "3306"),
};

const pool = mysql.createPool({
       ...dbConfig,
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0,
});

export const testConnection = async () => {
       try {
              await pool.getConnection();
              console.log("Database connected successfully");
              return true;
       } catch (error) {
              console.error("Database connection failed:", error);
              return false;
       }
};

export default pool;
