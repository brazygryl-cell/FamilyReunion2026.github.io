import fs from "fs";
import path from "path";

export const handler = async (event) => {
  const topic = event.queryStringParameters?.topic || "general";
  const dbPath = path.join(process.cwd(), "data", `${topic}.json`);

  // Ensure file exists
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "[]", "utf8");
  }

  // Load posts
  let posts = JSON.parse(fs.readFileSync(dbPath, "utf8") || "[]");

  // GET → return posts
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      body: JSON.stringify(posts.reverse()),
    };
  }

  // POST → add new post
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
      body: JSON.stringify(newPost),
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
