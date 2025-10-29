const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, "service-account.json");
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const { board, body, user } = data;

    if (!body || !board || !user) {
      return { statusCode: 400, body: "Missing fields" };
    }

    await db.collection(`forum_${board}`).add({
      body,
      by: user,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { statusCode: 200, body: "OK" };

  } catch (err) {
    console.error("🔥 Server Function Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
