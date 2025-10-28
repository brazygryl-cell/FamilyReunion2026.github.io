import admin from "firebase-admin";
import fs from "fs";

// ✅ Resolve service-account.json safely on Netlify
const serviceURL = new URL("./service-account.json", import.meta.url);
// Convert file URL → real file path & decode any % escapes
const servicePath = decodeURIComponent(serviceURL.pathname);

console.log("📄 Loading service-account.json from:", servicePath);

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(servicePath, "utf8"));
  console.log("✅ Parsed service account:", serviceAccount.project_id);
} catch (err) {
  console.error("❌ Could not read service-account.json:", err);
}

// ✅ Initialize Firebase Admin cleanly
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("🔥 Error initializing Firebase Admin:", err);
  }
}

const db = admin.firestore();

// ✅ Function Handler
export const handler = async (event) => {
  try {
    const params = new URLSearchParams(event.rawQuery || "");
    const board = params.get("board") || "general";

    console.log("📥 Fetching posts for:", `forum_${board}`);

    const ref = db.collection(`forum_${board}`).orderBy("createdAt", "desc");
    const snapshot = await ref.get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
