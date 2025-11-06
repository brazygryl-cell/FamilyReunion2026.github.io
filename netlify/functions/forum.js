import { getStore } from "@netlify/blobs";

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

const missingBlobsConfig = () =>
  !process.env.NETLIFY_BLOBS_CONTEXT &&
  !process.env.NETLIFY_BLOBS_URL &&
  !process.env.NETLIFY_BLOBS_TOKEN;

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    if (missingBlobsConfig()) {
      throw new Error(
        "Netlify Blobs is not enabled for this site. Enable Blobs in Site settings > Labs (beta) and redeploy."
      );
    }

    const store = getStore({ name: "forum-posts", consistency: "strong" });
    const existing = (await store.get("posts", { type: "json" })) || [];
    const posts = Array.isArray(existing) ? existing : [];

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
      await store.set("posts", updatedPosts, { type: "json" });

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
