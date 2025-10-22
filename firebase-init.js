// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ✅ Use values from window.env injected by env.js
const firebaseConfig = {
  apiKey: window.env.VITE_FIREBASE_API_KEY,
  authDomain: window.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: window.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: window.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: window.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: window.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
