import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

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

const TMP_POSTS_PATH = "/tmp/forum-posts.json";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_POSTS_PATH = path.resolve(__dirname, "../../data/posts.json");

const readSeedPosts = async () => {
  try {
    const raw = await fs.readFile(SEED_POSTS_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Unable to load seed posts", error);
    return [];
  }
};

const readPersistedPosts = async () => {
  try {
    const raw = await fs.readFile(TMP_POSTS_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Unable to read persisted posts", error);
    }
    return null;
  }
};

const writePersistedPosts = async (posts) => {
  await fs.writeFile(TMP_POSTS_PATH, JSON.stringify(posts, null, 2), "utf8");
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    const persisted = await readPersistedPosts();
    const posts =
      persisted === null ? await readSeedPosts() : Array.isArray(persisted) ? persisted : [];

    if (event.httpMethod === "GET") {
      return respond(200, [...posts].reverse());
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

      const newPost = {
        id: Date.now(),
        body,
        by: email,
        createdAt: new Date().toISOString(),
      };

      const updatedPosts = [...posts, newPost];
      try {
        await writePersistedPosts(updatedPosts);
      } catch (error) {
        console.warn("Failed to persist posts to /tmp", error);
        return respond(500, {
          error: "Unable to save your post right now. Please try again shortly.",
        });
      }

      return respond(200, newPost);
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
