// netlify/functions/forum-add.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async (req, res) => {
  try {
    const { board, title, body, by } = JSON.parse(req.body);

    if (!body || !board)
      return res.status(400).json({ error: "Missing required fields." });

    const newPost = {
      title: title || "Untitled",
      body,
      by: by || "Anonymous",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db.collection(`forum_${board}`).add(newPost);

    res.status(200).json({ success: true, id: ref.id });
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ error: "Failed to add post." });
  }
};

