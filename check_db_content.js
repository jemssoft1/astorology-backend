const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// Initialize Sequelize (assuming SQLite for local dev based on file list, or checking config)
// I noted 'vedastro.db' in the file list earlier.
// But package.json has mysql2.
// Let's check src/database/sequelize.ts to be sure.

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "vedastro.db", // Try SQLite first as per file list
  logging: false,
});

const Person = sequelize.define(
  "person",
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    ownerId: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    birthTime: { type: DataTypes.DATE },
    gender: { type: DataTypes.STRING },
    birthLocation: { type: DataTypes.STRING },
  },
  {
    tableName: "persons",
    timestamps: true,
  },
);

async function checkDb() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Check if table exists and count
    const persons = await Person.findAll();
    console.log(`Total persons: ${persons.length}`);

    persons.forEach((p) => {
      console.log(
        `ID: ${p.id}, Owner: ${p.ownerId}, Name: ${p.name}, Location: ${p.birthLocation}`,
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
}

checkDb();
