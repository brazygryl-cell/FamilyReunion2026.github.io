const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

if (!admin.apps.length) {
  const servicePath = path.join(__dirname, "service-account.json");
  const serviceAccount = JSON.parse(fs.readFileSync(servicePath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { board, body, user } = JSON.parse(event.body);

    await db.collection(`forum_${board}`).add({
      body,
      by: user || "Anonymous",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("🔥 Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
