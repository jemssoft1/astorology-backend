import { initDB, sequelize } from "../database/sequelize";
import { Person } from "../database/models/Person.model";

// Disable logging
sequelize.options.logging = false;

const TARGET_OWNER_ID = "guest-1qe0moswln2"; // The user's current session ID

async function run() {
  try {
    await initDB();
    console.log(`Migrating all persons to owner: ${TARGET_OWNER_ID}...`);

    const persons = await Person.findAll();
    console.log(`Found ${persons.length} total persons.`);

    let updatedCount = 0;

    for (const person of persons) {
      if (person.ownerId !== TARGET_OWNER_ID) {
        console.log(
          `Migrating person ${person.name} (ID: ${person.id}) from ${person.ownerId} to ${TARGET_OWNER_ID}`,
        );
        person.ownerId = TARGET_OWNER_ID;
        // Also need to update the ID if ID contains ownerId, but Person ID format is ownerId_name_year_hash
        // Updating ID is complex because it's PK.
        // But PersonRepository.getPersonList uses ownerId column.
        // So updating ownerId column should be enough for listing.
        // However, typically we don't change PK.
        // Let's just update ownerId column.
        await person.save();
        updatedCount++;
      }
    }

    console.log(`Successfully migrated ${updatedCount} persons.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
