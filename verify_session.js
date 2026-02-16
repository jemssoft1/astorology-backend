const fetch = require("node-fetch"); // Assuming node-fetch is available or using built-in in Node 18+
// If node-fetch is not available, I'll use http module or just rely on the test_script if node version supports fetch.
// Let's assume standard Node environment. If it fails, I'll retry with http.

async function verifySession() {
  const BASE_URL = "http://localhost:3000/api/session";

  try {
    console.log("1. Creating new session...");
    const newRes = await fetch(`${BASE_URL}/new`);
    const newData = await newRes.json();
    console.log("New Session Response:", newData);

    if (!newData.success || !newData.sessionId) {
      throw new Error("Failed to create session");
    }

    const sessionId = newData.sessionId;
    console.log(`\n2. Validating session: ${sessionId}`);
    const validRes = await fetch(`${BASE_URL}/validate/${sessionId}`);
    const validData = await validRes.json();
    console.log("Validate Response:", validData);

    if (!validData.valid) {
      throw new Error("Session should be valid but returned invalid");
    }

    console.log("\n3. Revoking session...");
    const revokeRes = await fetch(`${BASE_URL}/revoke/${sessionId}`, {
      method: "POST",
    });
    const revokeData = await revokeRes.json();
    console.log("Revoke Response:", revokeData);

    console.log("\n4. Validating revoked session...");
    const reValidRes = await fetch(`${BASE_URL}/validate/${sessionId}`);
    const reValidData = await reValidRes.json();
    console.log("Validate Revoked Response:", reValidData);

    if (reValidData.valid) {
      throw new Error("Session should be invalid after revoke");
    }

    console.log("\n✅ Verification Successful!");
  } catch (error) {
    console.error("\n❌ Verification Failed:", error.message);
  }
}

verifySession();
