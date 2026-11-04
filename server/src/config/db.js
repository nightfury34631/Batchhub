import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Production Security Check: No empty passwords or missing credentials in production
if (isProduction) {
  if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.trim() === "") {
    console.error("FATAL CONFIG ERROR: Empty DB_PASSWORD is not permitted in production.");
    process.exit(1);
  }
  if (!process.env.DB_USER || process.env.DB_USER.trim() === "") {
    console.error("FATAL CONFIG ERROR: DB_USER is required in production.");
    process.exit(1);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "batchhub_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool.promise();
