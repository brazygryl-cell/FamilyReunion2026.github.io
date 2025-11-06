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

const NETLIFY_API_BASE = "https://api.netlify.com/api/v1";
const FORM_NAME = process.env.FORUM_FORM_NAME || "forum-post";
const NETLIFY_FORM_ID = process.env.NETLIFY_FORM_ID || "";
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || "";
const NETLIFY_TOKEN =
  process.env.NETLIFY_API_TOKEN ||
  process.env.NETLIFY_AUTH_TOKEN ||
  process.env.NETLIFY_TOKEN ||
  "";

const buildNetlifyHeaders = (extra = {}) => {
  if (!NETLIFY_TOKEN) {
    throw new Error(
      "Netlify Forms access is not configured. Set NETLIFY_API_TOKEN (or NETLIFY_AUTH_TOKEN/NETLIFY_TOKEN) to enable the forum."
    );
  }

  return {
    Authorization: `Bearer ${NETLIFY_TOKEN}`,
    Accept: "application/json",
    "User-Agent": "family-reunion-forum",
    ...extra,
  };
};

let cachedFormId = NETLIFY_FORM_ID;

const resolveFormId = async () => {
  if (cachedFormId) {
    return cachedFormId;
  }

  const endpoint = NETLIFY_SITE_ID
    ? `${NETLIFY_API_BASE}/sites/${NETLIFY_SITE_ID}/forms`
    : `${NETLIFY_API_BASE}/forms`;

  const response = await fetchApi(endpoint, {
    headers: buildNetlifyHeaders(),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Unable to list Netlify forms (${response.status}): ${detail}`);
  }

  const forms = await response.json();
  const match = Array.isArray(forms)
    ? forms.find((form) => form.name === FORM_NAME)
    : null;

  if (!match) {
    throw new Error(
      `Could not find a Netlify form named "${FORM_NAME}". Ensure the form exists or set NETLIFY_FORM_ID."
    );
  }

  cachedFormId = match.id;
  return cachedFormId;
};

const fetchFormPosts = async (formId) => {
  const response = await fetchApi(
    `${NETLIFY_API_BASE}/forms/${formId}/submissions?per_page=100`,
    {
      headers: buildNetlifyHeaders(),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Unable to load submissions from Netlify (${response.status}): ${detail}`
    );
  }

  const submissions = await response.json();
  if (!Array.isArray(submissions)) {
    return [];
  }

  return submissions.map((submission) => ({
    id: submission.id,
    body: submission.data?.message || "",
    by: submission.data?.email || "anonymous",
    createdAt: submission.created_at,
  }));
};

const submitFormPost = async (formId, { message, email }) => {
  const params = new URLSearchParams({
    "form-name": FORM_NAME,
    message,
    email,
  });

  const response = await fetchApi(
    `${NETLIFY_API_BASE}/forms/${formId}/submissions`,
    {
      method: "POST",
      headers: buildNetlifyHeaders({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Unable to create Netlify submission (${response.status}): ${detail}`
    );
  }

  const submission = await response.json();
  return {
    id: submission.id,
    body: submission.data?.message || message,
    by: submission.data?.email || email || "anonymous",
    createdAt: submission.created_at,
  };
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    const formId = await resolveFormId();

    if (event.httpMethod === "GET") {
      const posts = await fetchFormPosts(formId);
      return respond(200, posts.reverse());
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

      try {
        const submission = await submitFormPost(formId, {
          message: body,
          email,
        });
        return respond(200, submission);
      } catch (error) {
        console.error("Failed to submit Netlify form", error);
        return respond(500, {
          error: error.message.includes("Netlify Forms access is not configured")
            ? error.message
            : "Unable to save your post right now. Please try again shortly.",
          details: error.message,
        });
      }
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
