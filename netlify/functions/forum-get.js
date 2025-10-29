const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ✅ Ensure Firebase Admin is initialized ONCE
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, "service-account.json");

  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Cloud Function Handler
exports.handler = async (event) => {
  try {
    const board = event.queryStringParameters?.board || "general";

    const snapshot = await db
      .collection(`forum_${board}`)
      .orderBy("createdAt", "desc")
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(posts),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error("🔥 Server Function Error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
