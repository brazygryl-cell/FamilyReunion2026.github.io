import admin from "firebase-admin";
import { readFileSync } from "fs";

// ✅ Initialize Firebase Admin using your local JSON file
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync("netlify/functions/service-account.json", "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ✅ Actual Function Logic
export const handler = async (event) => {
  const { board } = event.queryStringParameters || {};

  if (!board) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing board parameter" }),
    };
  }

  try {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posts),
    };
  } catch (error) {
    console.error("❌ Firestore query failed:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Firestore query failed",
        details: error.message,
      }),
    };
  }
};
