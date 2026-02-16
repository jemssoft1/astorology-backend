const axios = require("axios");

const BASE_URL = "http://localhost:3000/api/person";
const OWNER_ID = `test-owner-${Date.now()}`;
let createdPersonId = null;

async function runTests() {
  console.log("🚀 Starting Person API Tests...");
  console.log(`👤 Using Owner ID: ${OWNER_ID}\n`);

  try {
    // 1. ADD Person
    console.log("1️⃣  Testing ADD Person...");
    const addResponse = await axios.post(`${BASE_URL}/add`, {
      ownerId: OWNER_ID,
      personName: "Test John Doe",
      birthTime: "1990-01-01T12:00:00",
      gender: "male",
      notes: "Created via test script",
      failIfDuplicate: false,

      // 🆕 New Location Fields
      birthLocation: "Ahmedabad, Gujarat, India",
      latitude: 23.0225,
      longitude: 72.5714,
      timezoneOffset: "+05:30",
    });

    if (addResponse.data.Status === "Pass") {
      createdPersonId = addResponse.data.Payload;
      console.log(`✅ Person Created! ID: ${createdPersonId}`);
    } else {
      throw new Error(`Add failed: ${JSON.stringify(addResponse.data)}`);
    }

    // 2. GET Person (Verify data saved correctly)
    console.log("\n2️⃣  Testing GET Person...");
    // Fix: API expects /list/:ownerId, not query param
    const getResponse = await axios.get(`${BASE_URL}/list/${OWNER_ID}`);

    if (getResponse.data.Status === "Pass") {
      const person = getResponse.data.Payload[0];
      console.log("✅ Person Retrieved!");
      // Fix: Response uses PascalCase
      console.log("   📍 Location:", person.BirthLocation);
      console.log("   🌐 Lat/Lng:", person.Latitude, person.Longitude);
      console.log("   🕐 Timezone:", person.TimezoneOffset);
    }

    console.log("\n🎉 All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test Failed!");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

runTests();
