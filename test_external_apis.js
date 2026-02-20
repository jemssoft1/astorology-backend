const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

const testBody = {
  day: 12,
  month: 5,
  year: 1994,
  hour: 12,
  min: 25,
  lat: 25.2056,
  lon: 19.2056,
  tzone: 5.5,
};

// All endpoints to test (sequential, one at a time)
const endpoints = [
  "/planets/extended",
  "/birth_details",
  "/astro_details",
  "/planets",
  "/ghat_chakra",
  "/kalsarpa_details",
  "/manglik",
  "/simple_manglik",
  "/basic_gem_suggestion",
  "/numero_report",
  "/numero_fav_lord",
  "/numero_fav_mantra",
  "/numero_table",
  "/major_vdasha",
  "/current_vdasha",
  "/current_vdasha_all",
  "/major_yogini_dasha",
  "/current_yogini_dasha",
  "/kp_house_cusps",
  "/sadhesati_current_status",
  "/horo_chart/D3",
  "/horo_chart/D4",
  "/horo_chart/D8",
  "/horo_chart/D10",
  "/horo_chart/D12",
  "/horo_chart/SUN",
  "/horo_chart/MOON",
  "/horo_chart/D2",
];

// Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testAllApis() {
  console.log("=== External API Proxy Test ===");
  console.log(`Testing ${endpoints.length} endpoints SEQUENTIALLY\n`);

  const results = { passed: [], failed: [] };

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    const label = `[${i + 1}/${endpoints.length}] ${ep}`;

    try {
      process.stdout.write(`⏳ ${label} ... `);
      const start = Date.now();
      const res = await axios.post(`${BASE_URL}${ep}`, testBody, {
        timeout: 30000,
      });
      const elapsed = Date.now() - start;

      const keys = Object.keys(
        Array.isArray(res.data) ? res.data[0] || {} : res.data,
      ).slice(0, 4);
      console.log(`✅ ${elapsed}ms (keys: ${keys.join(", ")})`);
      results.passed.push(ep);
    } catch (err) {
      const status = err.response?.status || err.code || "UNKNOWN";
      const msg = err.response?.data?.error || err.message;
      console.log(`❌ ${status} - ${msg}`);
      results.failed.push({ ep, status, msg });
    }

    // Wait 500ms between requests to avoid overwhelming the external API
    if (i < endpoints.length - 1) {
      await delay(500);
    }
  }

  // Summary
  console.log("\n=== SUMMARY ===");
  console.log(`✅ Passed: ${results.passed.length}/${endpoints.length}`);
  console.log(`❌ Failed: ${results.failed.length}/${endpoints.length}`);

  if (results.failed.length > 0) {
    console.log("\nFailed endpoints:");
    results.failed.forEach(({ ep, status, msg }) => {
      console.log(`  - ${ep}: [${status}] ${msg}`);
    });
  }
}

testAllApis();
