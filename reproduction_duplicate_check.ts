import { PersonRepository } from "./src/database/repositories/PersonRepository";
import { Gender } from "./src/database/models/Person.model";
import { sequelize } from "./src/database/sequelize";
import { Person } from "./src/database/models/Person.model";

async function test() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    const ownerId = "test_dup_user_" + Date.now();
    const name = "Duplicate Test Person";
    const birthTime = new Date("2000-01-01T10:00:00Z");

    console.log("\n--- Step 1: Adding first person ---");
    const person1 = await PersonRepository.create(
      {
        ownerId,
        name,
        birthTime,
        gender: Gender.MALE,
        latitude: 0,
        longitude: 0,
        birthLocation: "Test City",
      },
      true,
    );
    console.log("✅ First person added with ID:", person1.id);

    console.log("\n--- Step 2: Adding second person (SAME DETAILS) ---");
    try {
      const person2 = await PersonRepository.create(
        {
          ownerId,
          name,
          birthTime,
          gender: Gender.MALE,
          latitude: 0,
          longitude: 0,
          birthLocation: "Test City",
        },
        true,
      ); // failIfDuplicate = true

      console.log(
        "❌ FAIL: Duplicate person added successfully! ID:",
        person2.id,
      );
    } catch (e: any) {
      console.log(
        "✅ PASS: Duplicate person rejected with error: " + e.message,
      );
    }

    // Cleanup
    await Person.destroy({ where: { ownerId } });
    console.log("\n🧹 Cleanup done.");
  } catch (e) {
    console.error("❌ Unexpected Error:", e);
  } finally {
    await sequelize.close();
    console.log("Database connection closed.");
  }
}

test();
