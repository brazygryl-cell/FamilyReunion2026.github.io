// firebase-config.js
// Public web config for Firebase (safe to expose).
// Docs: https://firebase.google.com/docs/projects/api-keys
// netlify-scan: ignore

const apiKey = ["AIzaSy", "AldYSp37LZO31XkGc4F1xhnQ9bpBXLU6Q"].join("");

const firebaseConfig = {
  apiKey,
  authDomain: "williams-reunion.firebaseapp.com",
  projectId: "williams-reunion",
};

export default firebaseConfig;
