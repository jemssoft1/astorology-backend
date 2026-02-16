import fs from "fs/promises";
import path from "path";
import { getPool } from "./config";

async function resetDatabase() {
  console.log("🔄 Starting Database Reset...");

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    // 1. Drop existing tables (Order matters due to Foreign Keys)
    console.log("🗑️  Dropping existing tables...");

    // Disable foreign key checks to allow arbitrary drop order (safest)
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    const tables = ["matches", "persons", "api_logs", "error_logs", "users"];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`   - Dropped ${table}`);
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Read and Execute Schema
    console.log("📄 Reading schema file...");
    const schemaPath = path.join(
      __dirname,
      "migrations",
      "001_initial_schema.sql",
    );
    const schemaSql = await fs.readFile(schemaPath, "utf-8");

    // Split by semicolon to get individual statements
    // naive split, but works for standard SQL dumps usually
    const statements = schemaSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`🚀 Executing ${statements.length} schema statements...`);

    for (const statement of statements) {
      // Skip comments if strictly comments
      if (statement.startsWith("--")) continue;

      try {
        await connection.query(statement);
      } catch (err: any) {
        console.error(
          "❌ Error executing statement:",
          statement.substring(0, 50) + "...",
        );
        console.error(err.message);
        throw err;
      }
    }

    console.log("✅ Database Reset Complete! Schema applied successfully.");
    console.log("✨ You can now start the server with: npm start");
  } catch (error) {
    console.error("💥 Database Reset Failed:", error);
  } finally {
    connection.release();
    await pool.end();
  }
}

resetDatabase();
