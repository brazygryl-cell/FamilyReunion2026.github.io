// ✅ Load env values
const config = {
  apiKey: window.ENV.FIREBASE_API_KEY,
  authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
  projectId: window.ENV.FIREBASE_PROJECT_ID,
};

// ✅ Initialize core Firebase app
const app = firebase.initializeApp(config);

// ✅ Initialize Firebase Auth + Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// ✅ Expose globally for debugging in console
window.auth = auth;
window.db = db;
