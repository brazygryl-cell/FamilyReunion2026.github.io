import fs from "fs";
import path from "path";

export const handler = async (event) => {
  const dbPath = path.join(process.cwd(), "data", "posts.json");

  // Ensure file exists
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
    fs.writeFileSync(dbPath, "[]");
  }

  let posts = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  // GET posts
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      body: JSON.stringify(posts.reverse()),
    };
  }

  // ADD post
  if (event.httpMethod === "POST") {
    if (!event.body) return { statusCode: 400, body: "Missing data" };

    const { body, email } = JSON.parse(event.body);
    if (!body || !email) return { statusCode: 400, body: "Missing fields" };

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

  return { statusCode: 405, body: "Method not allowed" };
};
