import fs from "fs";
import path from "path";

export const handler = async (event) => {
  // ✅ Look for posts.json in the ROOT of the repo
  const dbPath = path.join(process.cwd(), "posts.json");

  // Load existing posts
  let posts = [];
  if (fs.existsSync(dbPath)) {
    posts = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  }

  // ✅ GET → return posts
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posts.reverse()), // newest first
    };
  }

  // ✅ POST → add new post
  if (event.httpMethod === "POST") {
    if (!event.body) {
      return { statusCode: 400, body: "Missing post data" };
    }

    const { body, email } = JSON.parse(event.body);
    if (!body || !email) {
      return { statusCode: 400, body: "Missing required fields" };
    }

    const newPost = {
      id: Date.now(),
      body,
      by: email,
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
