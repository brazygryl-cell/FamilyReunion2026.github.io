// forum-get.js — CommonJS-safe version
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccount;

// Find and load your service-account.json
try {
  const servicePath = path.join(__dirname, "service-account.json");
  if (!fs.existsSync(servicePath)) {
    throw new Error(`service-account.json not found at ${servicePath}`);
  }

  const data = fs.readFileSync(servicePath, "utf8");
  serviceAccount = JSON.parse(data);
  console.log("✅ service-account.json loaded");
} catch (err) {
  console.error("🔥 Could not read service-account.json:", err);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("🔥 Firebase init error:", err);
  }
}

const db = admin.firestore();

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
