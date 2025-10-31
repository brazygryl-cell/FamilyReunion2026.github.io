// firebase-config.public.js

export default function getFirebaseConfig() {
  // ✅ Fallback to literal strings if env.js hasn't loaded yet
  const API_KEY = window._env_?.FIREBASE_API_KEY || "";
  const AUTH_DOMAIN = window._env_?.FIREBASE_AUTH_DOMAIN || "williams-reunion.firebaseapp.com";
  const PROJECT_ID = window._env_?.FIREBASE_PROJECT_ID || "williams-reunion";

  if (!API_KEY) {
    console.warn("⚠️ FIREBASE_API_KEY is missing. Check env.js or your Netlify environment variables.");
  }

  return {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID
  };
}
