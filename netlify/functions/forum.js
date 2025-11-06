import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_POSTS_PATH = path.resolve(__dirname, "../../data/posts.json");

const GITHUB_OWNER = process.env.GITHUB_OWNER || "FamilyReunion2026";
const GITHUB_REPO = process.env.GITHUB_REPO || "FamilyReunion2026.github.io";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || "data/posts.json";

const githubContentUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

const GITHUB_TOKEN =
@@ -33,87 +36,87 @@ const buildGithubHeaders = (extra = {}) => {
    "User-Agent": "family-reunion-forum",
    Accept: "application/vnd.github.v3+json",
    ...extra,
  };

  if (GITHUB_TOKEN) {
    baseHeaders.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return baseHeaders;
};

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

const fetchGithubPosts = async () => {
  try {
    const response = await fetchApi(`${githubContentUrl}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
      headers: buildGithubHeaders(),
    });

    if (!response.ok) {
      if (response.status !== 404) {
        const detail = await response.text();
        console.warn("Failed to load posts from GitHub", response.status, detail);
      }
      return null;
    }

    const payload = await response.json();
    if (!payload || !payload.content) {
      return { posts: [], sha: payload?.sha || null };
    }

    const decoded = Buffer.from(payload.content, payload.encoding || "base64").toString("utf8");
    const data = JSON.parse(decoded);
    return { posts: Array.isArray(data) ? data : [], sha: payload.sha || null };
  } catch (error) {
    console.warn("Unable to reach GitHub for posts", error);
    return null;
  }
};

const persistPostsToGithub = async (posts, sha) => {
  if (!GITHUB_TOKEN) {
    throw new Error(
      "Forum storage is not configured. Set the GITHUB_TOKEN (or GITHUB_WRITE_TOKEN) environment variable to enable saving posts."
    );
  }

  const message = `chore: update forum posts ${new Date().toISOString()}`;
  const content = Buffer.from(JSON.stringify(posts, null, 2)).toString("base64");

  const response = await fetchApi(githubContentUrl, {
    method: "PUT",
    headers: buildGithubHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      message,
      content,
      branch: GITHUB_BRANCH,
      sha: sha || undefined,
      committer: {
        name: "Family Reunion Forum",
        email: "no-reply@familyreunion2026.blog",
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub update failed (${response.status}): ${detail}`);
  }
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

