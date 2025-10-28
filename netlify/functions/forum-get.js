import admin from "firebase-admin";
import fs from "fs";

// --- Step 1: Load service account using import.meta.url for Netlify ---
const servicePath = new URL("./service-account.json", import.meta.url).pathname;
console.log("📄 Using service-account.json at:", servicePath);

let serviceAccount;
try {
  const data = fs.readFileSync(servicePath, "utf8");
  serviceAccount = JSON.parse(data);
  console.log("✅ Loaded service account for project:", serviceAccount.project_id);
} catch (err) {
  console.error("❌ Failed to read service-account.json:", err);
}

// --- Step 2: Initialize Admin SDK explicitly ---
if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (err) {
    console.error("🔥 Firebase init error:", err);
  }
} else {
  console.error("⚠️ Skipping init — serviceAccount missing or already initialized.");
}

const db = admin.firestore();

// --- Step 3: Cloud Function ---
export const handler = async (event) => {
  try {
    const params = new URLSearchParams(event.rawQuery || "");
    const board = params.get("board") || "general";

    console.log(`📥 Fetching posts for board: forum_${board}`);
    const snapshot = await db.collection(`forum_${board}`).orderBy("createdAt", "desc").get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
