const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// --- Load service account file ---
const servicePath = path.join(__dirname, "service-account.json");

console.log("🔍 Looking for service-account.json at:", servicePath);
console.log("📁 File exists:", fs.existsSync(servicePath));

let serviceAccount = null;

try {
  serviceAccount = JSON.parse(fs.readFileSync(servicePath, "utf8"));
  console.log("✅ Service account file loaded");
} catch (err) {
  console.error("❌ Failed to read service-account.json:", err);
}

// --- Initialize Firebase Admin ---
if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase Admin initialized successfully");
  } catch (err) {
    console.error("❌ Firebase Admin initialization error:", err);
  }
} else if (!serviceAccount) {
  console.error("⚠️ Firebase Admin NOT initialized — serviceAccount is null");
}

const db = admin.firestore();

// --- Function Handler ---
exports.handler = async (event) => {
  try {
    const board = event.queryStringParameters?.board || "general";
    console.log(`📨 Fetching posts for board: forum_${board}`);

    const snapshot = await db
      .collection(`forum_${board}`)
      .orderBy("createdAt", "desc")
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Retrieved ${posts.length} posts`);

    return {
      statusCode: 200,
      body: JSON.stringify(posts),
      headers: { "Content-Type": "application/json" },
    };

  } catch (err) {
    console.error("🔥 Error fetching posts:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { "Content-Type": "application/json" },
    };
  }
};


