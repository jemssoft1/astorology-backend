const axios = require("axios");

const baseUrl = "http://localhost:3000/api/person";

async function testList(ownerId) {
  try {
    console.log(`\nTesting list for ownerId: ${ownerId}`);
    const url = `${baseUrl}/list/${ownerId}`;
    console.log(`URL: ${url}`);
    const res = await axios.get(url);
    console.log(`Status: ${res.status}`);

    // Check Payload structure
    if (res.data && res.data.Payload) {
      if (Array.isArray(res.data.Payload)) {
        console.log(`Count: ${res.data.Payload.length}`);
        if (res.data.Payload.length > 0) {
          console.log(
            "First Item Full:",
            JSON.stringify(res.data.Payload[0], null, 2),
          );
        } else {
          console.log("Payload is empty array []");
        }
      } else {
        console.log("Payload Type:", typeof res.data.Payload);
        console.log("Payload Value:", res.data.Payload);
      }
    } else {
      console.log("Response does not contain Payload:", res.data);
    }
  } catch (error) {
    console.error(`Error listing for ${ownerId}:`, error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
  }
}

async function run() {
  console.log("--- STARTING TEST ---");
  await testList("guest-qy5lfqmn4xe");
  console.log("--- END TEST ---");
}

run();
