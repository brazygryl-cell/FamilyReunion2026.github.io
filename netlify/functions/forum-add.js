import admin from "firebase-admin";
import { readFileSync } from "fs";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync("netlify/functions/service-account.json", "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { board, body } = JSON.parse(event.body);
    if (!body) return { statusCode: 400, body: "No post body provided" };

    const docRef = await db.collection(`forum_${board}`).add({
      body,
      createdAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: docRef.id }),
    };
  } catch (err) {
    console.error("Error adding post:", err);
    return { statusCode: 500, body: `Error: ${err.message}` };
  }
};

