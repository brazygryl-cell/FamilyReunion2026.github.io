const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// ✅ Ensure Firestore Admin is initialized once
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, "service-account.json");
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { board, text, user } = body;

    if (!board || !text || !user) {
      return { statusCode: 400, body: "Missing fields" };
    }

    await db.collection(`forum_${board}`).add({
      body: text,
      by: user,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("🔥 Add Post Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
