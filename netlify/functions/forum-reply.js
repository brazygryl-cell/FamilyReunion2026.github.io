// netlify/functions/forum-reply.js
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
    const { board, postId, replyText, by } = JSON.parse(req.body);

    if (!board || !postId || !replyText)
      return res.status(400).json({ error: "Missing required fields." });

    await db
      .collection(`forum_${board}`)
      .doc(postId)
      .collection("replies")
      .add({
        text: replyText,
        by: by || "Anonymous",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: "Failed to add reply." });
  }
};

