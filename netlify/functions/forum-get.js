// forum-get.js — compatible with Netlify’s Node runtime (CommonJS)
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

let serviceAccount;

try {
  // Safe path resolution — handles both local and Netlify deployments
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const servicePath = path.join(__dirname, "service-account.json");
  serviceAccount = JSON.parse(readFileSync(servicePath, "utf8"));
} catch (err) {
  console.error("🔥 Could not read service-account.json:", err);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized in forum-get.js");
  } catch (err) {
    console.error("🔥 Failed to initialize Firebase Admin:", err);
  }
}

const db = admin.firestore();

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const board = event.queryStringParameters?.board || "general";
    console.log(`📥 Fetching posts from board: ${board}`);

    const snapshot = await db
      .collection(`forum_${board}`)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
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
