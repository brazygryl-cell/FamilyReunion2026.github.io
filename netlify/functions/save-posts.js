const fs = require("fs");
const path = require("path");

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const postsPath = path.join(__dirname, "..", "..", "posts.json");

    // Read existing posts
    let posts = [];
    if (fs.existsSync(postsPath)) {
      posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
    }

    // Add new post
    posts.push({
      topic: body.topic,
      text: body.text,
      user: body.user,
      timestamp: Date.now()
    });

    // Save updated posts
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Post saved successfully!" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
