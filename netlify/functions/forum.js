import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

export default async function handler(req, res) {
  // Simple example: return all posts in the "general" board
  try {
    const snapshot = await db.collection("forum_general").orderBy("createdAt", "desc").get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ posts });
  } catch (err) {
    console.error("Error fetching forum:", err);
    res.status(500).json({ error: "Failed to load posts" });
  }
}
