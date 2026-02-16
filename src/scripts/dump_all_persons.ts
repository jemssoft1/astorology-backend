import { initDB, sequelize } from "../database/sequelize";
import { Person } from "../database/models/Person.model";

// Disable logging for cleaner output
sequelize.options.logging = false;

async function run() {
  try {
    await initDB();
    console.log("Fetching all persons...");
    const persons = await Person.findAll();

    console.log(`Initial Count: ${persons.length}`);

    if (persons.length === 0) {
      console.log("No persons found in database.");
    } else {
      console.log("List of Persons:");
      persons.forEach((p) => {
        console.log(
          `- ID: ${p.id}, Owner: ${p.ownerId}, Name: ${p.name}, Created: ${p.createdAt}`,
        );
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
