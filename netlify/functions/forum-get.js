// netlify/functions/forum-get.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

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
      body: JSON.stringify({ error: "Firestore query failed", details: error.message }),
    };
  }
};
