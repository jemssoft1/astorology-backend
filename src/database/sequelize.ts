import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { Person } from "./models/Person.model";
import { Visitor } from "./models/Visitor.model";
import { ApiLog } from "./models/ApiLog.model";
import { ErrorLog } from "./models/ErrorLog.model";
import { Match } from "./models/Match.model";
import { User } from "./models/User.model";

dotenv.config();

export const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "astroweb",
  logging: console.log, // Log queries for debugging
  models: [Person, Visitor, ApiLog, ErrorLog, Match, User], // Register models here
  dialectOptions: {
    // Ensure dates are read as UTC +00:00 and not converted to local time by driver automatically
    // This helps in consistent date handling
    timezone: "Z",
  },
  timezone: "+00:00", // Sequelize timezone
});

export const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Sequelize connection established successfully.");
    // Sync models with database (create tables if not exist)
    // Using force: false to prevent altering existing tables (avoids "too many keys" error)
    await sequelize.sync({ force: false });
    console.log("✅ Database models synchronized.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};
