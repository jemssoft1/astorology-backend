const axios = require("axios");

const baseUrl = "http://localhost:3000/api";

const payload = {
  day: 28,
  month: 4,
  year: 2004,
  hour: 11,
  min: 13,
  lat: 21.17,
  lon: 72.83,
  tzone: 5.5,
};

async function testEndpoint(endpoint) {
  try {
    console.log(`Testing ${endpoint}...`);
    const res = await axios.post(`${baseUrl}${endpoint}`, payload);
    console.log(`Success ${endpoint}:`, res.status);
    console.log(JSON.stringify(res.data, null, 2).substring(0, 200));
  } catch (error) {
    console.error(`Error ${endpoint}:`, error.message);
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
  await testEndpoint("/lalkitab_remedies/Sun");
  await testEndpoint("/lalkitab_houses");
}

run();
