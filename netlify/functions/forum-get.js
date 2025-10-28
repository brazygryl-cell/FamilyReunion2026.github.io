const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// Load service account properly
const servicePath = path.join(__dirname, "service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(servicePath, "utf8"));

// Initialize Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id, // ✅ important fix
  });
}

const db = getFirestore();

exports.handler = async (event) => {
  try {
    const board = event.queryStringParameters.board || "general";

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
      headers: { "Content-Type": "application/json" }
    };

  } catch (err) {
    console.error("🔥 Error fetching posts:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
