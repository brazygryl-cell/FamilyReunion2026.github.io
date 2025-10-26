// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Pull values from injected environment vars
const firebaseConfig = {
  apiKey: window.env.FIREBASE_API_KEY,
  authDomain: window.env.FIREBASE_AUTH_DOMAIN,
  projectId: window.env.FIREBASE_PROJECT_ID,
  storageBucket: window.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: window.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
console.log("✅ Firebase initialized successfully");

