import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// --- Load the service account manually and explicitly initialize Admin ---
const servicePath = path.resolve("netlify/functions/service-account.json");
console.log("📄 Using service account path:", servicePath);

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(servicePath, "utf8"));
  console.log("✅ service-account.json loaded. Project:", serviceAccount.project_id);
} catch (err) {
  console.error("❌ Failed to load service-account.json:", err);
}

if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log("✅ Firebase Admin initialized with:", serviceAccount.client_email);
  } catch (err) {
    console.error("🔥 Firebase init error:", err);
  }
} else {
  console.error("⚠️ Skipping init — missing service account data.");
}

const db = admin.firestore();

// --- Function Handler ---
export const handler = async (event) => {
  try {
    const params = new URLSearchParams(event.rawQuery || "");
    const board = params.get("board") || "general";
    console.log(`📥 Fetching posts from forum_${board}`);

    const snapshot = await db.collection(`forum_${board}`).orderBy("createdAt", "desc").get();
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      statusCode: 200,
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
