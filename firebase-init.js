// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// 🔥 Your Firebase config
// (keep the same values from your env.js or Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyA5G9ZrrV62qx1DRNy_BdIImevD1IL2Grc",
  authDomain: "family-reunion-2026.firebaseapp.com",
  projectId: "family-reunion-2026",
  storageBucket: "family-reunion-2026.firebasestorage.app",
  messagingSenderId: "110890823431",
  appId: "1:110890823431:web:524b468c6371c260405fa2"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export for use across pages
export { app, db, auth, provider };
