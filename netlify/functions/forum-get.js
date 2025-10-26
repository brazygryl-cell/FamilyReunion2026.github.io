// forum-get.js — fully defensive Netlify/Lambda version
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let db;

try {
  const servicePath = path.join(__dirname, "service-account.json");
  console.log("📄 Looking for service-account.json at:", servicePath);

  if (!fs.existsSync(servicePath)) {
    throw new Error(`service-account.json not found`);
  }

  const raw = fs.readFileSync(servicePath, "utf8");
  const serviceAccount = JSON.parse(raw);

  console.log("✅ service-account.json read successfully");

  // Always init app (Netlify may clear admin.apps)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized");

  db = admin.firestore();
} catch (err) {
  console.error("🔥 Firebase init failed:", err);
}

exports.handler = async (event) => {
  if (!db) {
    console.error("❌ Firestore not initialized");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Firestore not initialized" }),
    };
  }

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
