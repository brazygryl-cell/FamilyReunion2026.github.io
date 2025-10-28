const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

let serviceAccount;

try {
  const servicePath = path.join(__dirname, "service-account.json");
  console.log("📂 Loading service-account.json from:", servicePath);

  const raw = fs.readFileSync(servicePath, "utf8");
  serviceAccount = JSON.parse(raw);

} catch (err) {
  console.error("❌ Unable to read service-account.json:", err);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized");
} else {
  console.log("⚠️ Firebase Admin NOT initialized (missing service-account.json)");
}

const db = admin.firestore();

export const handler = async (event) => {
  try {
    const params = new URLSearchParams(event.rawQuery || "");
    const board = params.get("board") || "general";

    console.log("📥 Fetching:", `forum_${board}`);

    const ref = db.collection(`forum_${board}`).orderBy("createdAt", "desc");
    const snapshot = await ref.get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      statusCode: 200,
      body: JSON.stringify(posts),
    };
  } catch (err) {
    console.error("🔥 FETCH ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
