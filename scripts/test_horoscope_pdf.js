const axios = require("axios");

const payload = {
  name: "ronik gorasiya",
  day: 24,
  month: 3,
  year: 2002,
  hour: 7,
  minute: 45,
  latitude: 21.2056,
  longitude: 72.2056,
  language: "en",
  timezone: 5.5,
  place: "surat, Gujarat India",
  footer_link: "astrologyapi.in",
  logo_url: "https://example.com/logo.png",
  company_name: "Vedic Rishi Astro Solutions Pvt. Ltd.",
  company_info: "Your Company Info (less than 500 characters)",
  domain_url: "https://www.astrologyapi.in",
  company_email: "mail@astrologyapi.in",
  company_landline: "+91-22123222",
  company_mobile: "+91-9727168583",
};

async function testApi() {
  try {
    console.log("Sending request to /api/generate-horoscope...");
    const response = await axios.post(
      "http://localhost:3000/api/generate-horoscope",
      payload,
    );
    console.log("Response Status:", response.status);
    console.log("Response Body:", response.data);

    if (response.data.success && response.data.pdfUrl) {
      console.log("\n✅ SUCCESS: API returned success and PDF URL.");
      console.log("PDF URL:", response.data.pdfUrl);
    } else {
      console.error("\n❌ FAILURE: API did not return success or PDF URL.");
    }
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
  }
}

testApi();
