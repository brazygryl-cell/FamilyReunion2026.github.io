// firebase-config.public.js
export default function getFirebaseConfig() {
  const API_KEY = window.ENV?.FIREBASE_API_KEY || "";
  const AUTH_DOMAIN = window.ENV?.FIREBASE_AUTH_DOMAIN || "williams-reunion.firebaseapp.com";
  const PROJECT_ID = window.ENV?.FIREBASE_PROJECT_ID || "williams-reunion";

  if (!API_KEY) {
    console.warn("⚠️ FIREBASE_API_KEY missing — check env.js");
  }

  return {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID
  };
}
