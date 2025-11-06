import { readFile } from "node:fs/promises";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const respond = (statusCode, payload = {}) => ({
  statusCode,
  headers,
  body: JSON.stringify(payload),
});

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "";
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || "";
const FIREBASE_PRIVATE_KEY = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || "";
const FIREBASE_COLLECTION = process.env.FORUM_FIREBASE_COLLECTION || "forumPosts";

let firestoreInstance;

const ensureFirestore = () => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      "Firebase credentials are not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in Netlify environment variables to enable forum storage."
    );
  }

  if (!getApps().length) {
    const options = {
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY,
      }),
    };

    if (FIREBASE_DATABASE_URL) {
      options.databaseURL = FIREBASE_DATABASE_URL;
    }

    initializeApp(options);
  }

  firestoreInstance = getFirestore();
  return firestoreInstance;
};

const readSeedPosts = async () => {
  try {
    const buffer = await readFile(`./data/posts.json`, "utf-8");
    const data = JSON.parse(buffer);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Falling back to empty posts seed", error);
    return [];
  }
};

const toIsoString = (value) => {
  if (!value) {
    return new Date().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (typeof value.seconds === "number") {
    return new Date(value.seconds * 1000).toISOString();
  }

  return new Date().toISOString();
};

const loadPostsFromFirebase = async () => {
  const db = ensureFirestore();
  const snapshot = await db
    .collection(FIREBASE_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() || {};

    return {
      id: doc.id,
      body: data.body || "",
      by: data.by || "anonymous",
      createdAt: toIsoString(data.createdAtIso || data.createdAt),
    };
  });
};

const savePostToFirebase = async ({ body, email }) => {
  const db = ensureFirestore();
  const createdAt = new Date();

  const docRef = await db.collection(FIREBASE_COLLECTION).add({
    body,
    by: email || "anonymous",
    createdAt: Timestamp.fromDate(createdAt),
    createdAtIso: createdAt.toISOString(),
  });

  return {
    id: docRef.id,
    body,
    by: email || "anonymous",
    createdAt: createdAt.toISOString(),
  };
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    if (event.httpMethod === "GET") {
      try {
        const posts = await loadPostsFromFirebase();
        return respond(200, posts);
      } catch (error) {
        console.error("Falling back to seeded posts", error);
        const posts = await readSeedPosts();
        return respond(200, posts.slice().reverse());
      }
    }

    if (event.httpMethod === "POST") {
      if (!event.body) {
        return respond(400, { error: "Missing data" });
      }

      let payload;
      try {
        payload = JSON.parse(event.body);
      } catch (error) {
        return respond(400, { error: "Invalid JSON" });
      }

      const { body, email } = payload;
      if (!body || !email) {
        return respond(400, { error: "Missing fields" });
      }

      try {
        const newPost = await savePostToFirebase({ body, email });
        return respond(200, newPost);
      } catch (error) {
        console.error("Failed to persist forum post", error);
        const message = error.message.includes("Firebase credentials are not configured")
          ? error.message
          : "Unable to save your post right now. Please try again later.";

        return respond(500, {
          error: message,
          details: error.message,
        });
      }
    }

    return respond(405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Forum function failed", error);
    return respond(500, {
      error: "Forum storage is currently unavailable.",
      details: error.message,
    });
  }
};
