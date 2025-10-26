const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccount;

try {
  const servicePath = path.join(__dirname, "service-account.json");
  console.log("📂 Looking for service-account.json at:", servicePath);

  if (!fs.existsSync(servicePath)) {
    console.error("❌ service-account.json missing");
  } else {
    const data = fs.readFileSync(servicePath, "utf8");
    console.log("✅ service-account.json found, length:", data.length);
    serviceAccount = JSON.parse(data);
  }
} catch (err) {
  console.error("🔥 Could not read service-account.json:", err);
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (err) {
    console.error("🔥 Firebase init error:", err);
  }
} else {
  console.error("⚠️ Skipping init — serviceAccount is null");
}

const db = admin.firestore();

