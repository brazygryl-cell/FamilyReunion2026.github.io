import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Fix path resolution so Netlify always finds the JSON file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(__dirname, "service-account.json");
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized in forum-add.js");
  } catch (err) {
    console.error("🔥 Failed to initialize Firebase Admin:", err);
  }
}

const db = admin.firestore();

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { board, body } = JSON.parse(event.body);
    if (!board || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing board or body" }),
      };
    }

    // Add post to Firestore
    const postRef = await db.collection(`forum_${board}`).add({
      body,
      board,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Added post to ${board}: ${postRef.id}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Post added successfully!",
        id: postRef.id,
      }),
    };
  } catch (err) {
    console.error("🔥 Error adding post:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

