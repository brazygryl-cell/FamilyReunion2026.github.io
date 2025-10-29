const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// ✅ Ensure we always initialize Admin SDK correctly
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
    const board = event.queryStringParameters?.board || "general";

    console.log(`📥 Fetching posts from: forum_${board}`);

    // ✅ Admin Firestore Query (No OAuth, No Client SDK)
    const snapshot = await db
      .collection(`forum_${board}`)
      .orderBy("createdAt", "desc")
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posts)
    };

  } catch (err) {
    console.error("🔥 Server Function Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
