import fs from "fs";
import path from "path";

export const handler = async (event) => {
  const dbPath = path.join(process.cwd(), "data", "posts.json");

  // Load database
  let posts = [];
  if (fs.existsSync(dbPath)) {
    posts = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  }

  const topic = event.queryStringParameters?.topic || "general";

  // GET → return posts
  if (event.httpMethod === "GET") {
    const filtered = posts.filter(p => p.topic === topic);
    return {
      statusCode: 200,
      body: JSON.stringify(filtered.reverse())
    };
  }

  // POST → add post
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
      topic, // ✅ store topic from current tab
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    fs.writeFileSync(dbPath, JSON.stringify(posts, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify(newPost)
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};

