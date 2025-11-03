const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  const body = JSON.parse(event.body);

  // ✅ CHANGE THIS: Your repo info
  const repoOwner = "brazygryl-cell";
  const repoName = "FamilyReunion2026.github.io";
  const filePath = "posts.json";

  // ✅ This token is NOT stored in code. It comes from Netlify environment variable.
  const token = process.env.GITHUB_WRITE_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: "Missing GITHUB_WRITE_TOKEN in Netlify environment variables"
    };
  }

  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

  // Get existing file to retrieve its SHA hash
  const getFile = await fetch(apiUrl, {
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    }
  });

  const fileData = await getFile.json();
  const sha = fileData.sha;

  // Prepare updated content
  const updatedContent = Buffer.from(JSON.stringify(body, null, 2)).toString("base64");

  const commitMessage = `Updated posts: ${new Date().toISOString()}`;

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: commitMessage,
      content: updatedContent,
      sha
    })
  });

  if (res.ok) {
    return {
      statusCode: 200,
      body: "✅ Posts saved successfully"
    };
  } else {
    const error = await res.text();
    return {
      statusCode: 500,
      body: `❌ Error saving posts: ${error}`
    };
  }
};
