import dotenv from "dotenv";
import mysql from "mysql2/promise";

const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.dev";

dotenv.config({ path: envFile });

const dbConfig = {
       host: process.env.DB_HOST,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
       port: parseInt(process.env.DB_PORT || "3306"),
};
console.log(`Loaded environment from ${envFile}`);
console.log(`Connected with ${dbConfig.host} to database: ${dbConfig.database}`);
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
