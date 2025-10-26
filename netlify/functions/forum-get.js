// forum-get.js
import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Safe path resolution for Netlify runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const servicePath = path.join(__dirname, "service-account.json");

let serviceAccount;
try {
  if (!existsSync(servicePath)) {
    throw new Error(`service-account.json not found at ${servicePath}`);
  }
  serviceAccount = JSON.parse(readFileSync(servicePath, "utf8"));
  console.log("✅ service-account.json loaded");
} catch (err) {
  console.error("🔥 Failed to read service-account.json:", err);
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
  } catch (err) {
    console.error("🔥 Firebase Admin init error:", err);
  }
}

const db = admin.firestore();

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const board = event.queryStringParameters?.board || "general";
    const snapshot = await db
      .collection(`forum_${board}`)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(posts),
    };
  } catch (err) {
    console.error("🔥 Firestore fetch error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

