const axios = require("axios");
const fs = require("fs");

async function testMiniPdf() {
  const url = "http://localhost:3000/api/horoscope/mini-pdf";

  const payload = {
    name: "Test User",
    gender: "Male",
    day: 15,
    month: 8,
    year: 1990,
    hour: 14,
    min: 30,
    lat: 28.6139,
    lon: 77.209,
    tzone: 5.5,
    place: "New Delhi, India",
    language: "en",
    chart_style: "NORTH_INDIAN",
    footer_link: "www.jemsoft.com",
    logo_url: "https://via.placeholder.com/150",
    company_name: "Jemsoft Astrology",
    company_info: "Leading Vedic Astrology Solutions",
    domain_url: "https://www.jemsoft.com",
    company_email: "support@jemsoft.com",
    company_landline: "011-12345678",
    company_mobile: "+91-9876543210",
  };

  console.log("Sending request to /api/horoscope/mini-pdf...");
  try {
    const response = await axios.post(url, payload);
    console.log("Response Status:", response.status);
    console.log("Response Body:", response.data);

    if (response.data.status && response.data.pdf_url) {
      console.log("✅ SUCCESS: PDF Generated at", response.data.pdf_url);
    } else {
      console.error("❌ FAILED: Invalid response format");
    }
  } catch (error) {
    console.log(error);
    if (error.response) {
      console.error(
        "Error Response:",
        error.response.status,
        error.response.data,
      );
    } else {
      console.error("Error:", error.message);
    }
  }
}

testMiniPdf();
