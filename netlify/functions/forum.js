import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (event) => {
  const store = getStore({ name: "forum-posts", consistency: "strong" });

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const existing = (await store.get("posts", { type: "json" })) || [];
  const posts = Array.isArray(existing) ? existing : [];

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([...posts].reverse()),
    };
  }

  if (event.httpMethod === "POST") {
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing data" }) };
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (error) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const { body, email } = payload;
    if (!body || !email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing fields" }) };
    }

    const newPost = {
      id: Date.now(),
      body,
      by: email,
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);
    await store.set("posts", posts, { type: "json" });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(newPost),
    };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
};
