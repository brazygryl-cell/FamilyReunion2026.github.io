// firebase-config.js
// ✅ No hard-coded API key — safe for Netlify
export default {
  apiKey: window._env_.FIREBASE_API_KEY,
  authDomain: "williams-reunion.firebaseapp.com",
  projectId: "williams-reunion",
};
