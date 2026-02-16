import axios from "axios";
import { externalApiRouters } from "./utils/externalApiRouters";

const BASE_URL = "http://localhost:3000/api";

const testTime = {
  day: 12,
  month: 5,
  year: 1994,
  hour: 12,
  min: 25,
  lat: 25.2056,
  lon: 19.2056,
  tzone: 5.5,
};

async function testAllProxies() {
  console.log(
    "--- Starting Comprehensive External API Proxy Verification (including Vimshottari Dasha) ---",
  );

  const results: Record<string, any> = {};

  // 1. Test routes from externalApiRouters
  for (const [key, path] of Object.entries(externalApiRouters)) {
    try {
      console.log(`Testing [${key}] at ${path}...`);
      const response = await axios.post(`${BASE_URL}${path}`, testTime);
      results[key] = {
        success: true,
        endpoint: path,
        dataKeys: Object.keys(response.data).slice(0, 5), // Log first few keys
      };
      console.log(`✅ [${key}] Success`);
    } catch (error: any) {
      console.error(`❌ [${key}] Failed: ${error.message}`);
      results[key] = {
        success: false,
        endpoint: path,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  // 2. Test Parameterized Routess

  // Planet Ashtak
  try {
    const planet = "sun";
    console.log(`Testing [PlanetAshtak] for ${planet}...`);
    const response = await axios.post(
      `${BASE_URL}/planet_ashtak/${planet}`,
      testTime,
    );
    results["PlanetAshtak"] = {
      success: true,
      endpoint: `/planet_ashtak/${planet}`,
      dataKeys: Object.keys(response.data).slice(0, 5),
    };
    console.log(`✅ [PlanetAshtak] Success`);
  } catch (error: any) {
    console.error(`❌ [PlanetAshtak] Failed: ${error.message}`);
    results["PlanetAshtak"] = {
      success: false,
      error: error.message,
    };
  }

  // Sub Char Dasha
  try {
    const md = "Aries"; // Trying a sign name as MD
    console.log(`Testing [SubCharDasha] for ${md}...`);
    const response = await axios.post(
      `${BASE_URL}/sub_chardasha/${md}`,
      testTime,
    );
    results["SubCharDasha"] = {
      success: true,
      endpoint: `/sub_chardasha/${md}`,
      dataKeys: Object.keys(response.data).slice(0, 5),
    };
    console.log(`✅ [SubCharDasha] Success`);
  } catch (error: any) {
    console.error(`❌ [SubCharDasha] Failed: ${error.message}`);
    results["SubCharDasha"] = {
      success: false,
      error: error.message,
    };
  }

  // Current Vimshottari Dasha Date (Requires extra parameter)
  try {
    const dashaDate = "2024-05-12"; // YYYY-MM-DD format
    console.log(`Testing [CurrentVDashaDate] for ${dashaDate}...`);
    const response = await axios.post(`${BASE_URL}/current_vdasha_date`, {
      ...testTime,
      dasha_date: dashaDate,
    });
    results["CurrentVDashaDate"] = {
      success: true,
      endpoint: `/current_vdasha_date`,
      dataKeys: Object.keys(response.data).slice(0, 5),
    };
    console.log(`✅ [CurrentVDashaDate] Success`);
  } catch (error: any) {
    console.error(`❌ [CurrentVDashaDate] Failed: ${error.message}`);
    results["CurrentVDashaDate"] = {
      success: false,
      error: error.message,
    };
  }

  console.log("\n--- Verification Summary ---");
  const table = Object.entries(results).map(([name, res]) => ({
    API: name,
    Status: res.success ? "PASSED" : "FAILED",
    Keys: res.dataKeys ? res.dataKeys.join(", ") : "N/A",
  }));
  console.table(table);

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter((r) => r.success).length;
  console.log(`\nResults: ${passed}/${total} passed.`);
}

testAllProxies();
