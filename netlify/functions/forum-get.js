import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Convert module URL → usable filesystem path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Absolute path to credentials file
const servicePath = path.join(__dirname, "service-account.json");

console.log("📄 Looking for:", servicePath);

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(servicePath, "utf8"));
  console.log("✅ Loaded service-account.json");
} catch (err) {
  console.error("❌ Failed to read service-account.json:", err);
}

// ✅ Initialize Firebase Admin correctly
if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized");
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
