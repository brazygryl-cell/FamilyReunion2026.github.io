// ✅ forum-get.js — CommonJS + Netlify compatible version
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// --- Load the service account JSON ---
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

// --- Initialize Firebase Admin ---
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

// --- Netlify Function Export ---
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const board = event.queryStringParameters?.board || "general";
    console.log(`📥 Fetching posts from forum_${board}`);

    const snapshot = await db
      .collection(`forum_${board}`)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(posts),
    };
  } catch (err) {
    console.error("🔥 Error fetching posts:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

