import { readFile } from "node:fs/promises";
import nodeFetch from "node-fetch";

const fetchApi = globalThis.fetch || nodeFetch;

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

const OWNER_REPO = process.env.GITHUB_REPOSITORY || "FamilyReunion2026/FamilyReunion2026.github.io";
const [DEFAULT_OWNER, DEFAULT_REPO] = OWNER_REPO.split("/");
const GITHUB_OWNER = process.env.FORUM_GITHUB_OWNER || DEFAULT_OWNER;
const GITHUB_REPO = process.env.FORUM_GITHUB_REPO || DEFAULT_REPO;
const POSTS_PATH = process.env.FORUM_POSTS_PATH || "data/posts.json";
const TARGET_BRANCH = process.env.FORUM_TARGET_BRANCH || process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN =
  process.env.GITHUB_WRITE_TOKEN ||
  process.env.GITHUB_TOKEN ||
  process.env.GITHUB_ACCESS_TOKEN ||
  "";

const COMMITTER_NAME = process.env.FORUM_COMMITTER_NAME || "Family Reunion Bot";
const COMMITTER_EMAIL =
  process.env.FORUM_COMMITTER_EMAIL || "forum-bot@familyreunion2026.example";

const buildGitHubHeaders = (extra = {}) => ({
  Accept: "application/vnd.github+json",
  "User-Agent": "family-reunion-forum",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  ...extra,
});

const githubFileEndpoint = () =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${POSTS_PATH}`;

const readSeedPosts = async () => {
  try {
    const buffer = await readFile(`./${POSTS_PATH}`, "utf-8");
    const data = JSON.parse(buffer);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Falling back to empty posts seed", error);
    return [];
  }
};

const loadPostsFromGitHub = async () => {
  const endpoint = `${githubFileEndpoint()}?ref=${encodeURIComponent(TARGET_BRANCH)}`;
  const response = await fetchApi(endpoint, { headers: buildGitHubHeaders() });

  if (response.status === 404) {
    return { posts: await readSeedPosts(), sha: null };
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub read failed (${response.status}): ${detail}`);
  }

  const payload = await response.json();
  const decoded = Buffer.from(payload.content, payload.encoding || "base64").toString("utf-8");
  const posts = JSON.parse(decoded);
  return { posts: Array.isArray(posts) ? posts : [], sha: payload.sha };
};

const savePostsToGitHub = async ({ posts, sha }) => {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "GitHub token is not configured. Set GITHUB_WRITE_TOKEN or GITHUB_TOKEN in Netlify environment variables to save posts."
    );
  }

  const endpoint = githubFileEndpoint();
  const content = Buffer.from(JSON.stringify(posts, null, 2)).toString("base64");

  const body = {
    message: "Update forum posts",
    content,
    branch: TARGET_BRANCH,
    committer: {
      name: COMMITTER_NAME,
      email: COMMITTER_EMAIL,
    },
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetchApi(endpoint, {
    method: "PUT",
    headers: buildGitHubHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub write failed (${response.status}): ${detail}`);
  }

  return response.json();
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    if (event.httpMethod === "GET") {
      try {
        const { posts } = await loadPostsFromGitHub();
        return respond(200, posts.slice().reverse());
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

      let snapshot;
      try {
        snapshot = await loadPostsFromGitHub();
      } catch (error) {
        console.error("Unable to load posts before writing", error);
        return respond(500, {
          error: "Forum storage is currently unavailable.",
          details: error.message,
        });
      }

      const createdAt = new Date().toISOString();
      const newPost = {
        id: `${createdAt}-${Math.random().toString(36).slice(2, 10)}`,
        body,
        by: email || "anonymous",
        createdAt,
      };

      const posts = [...snapshot.posts, newPost];

      try {
        await savePostsToGitHub({ posts, sha: snapshot.sha });
      } catch (error) {
        console.error("Failed to persist forum post", error);
        return respond(500, {
          error: error.message.includes("GitHub token is not configured")
            ? error.message
            : "Unable to save your post right now. Please try again later.",
          details: error.message,
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
