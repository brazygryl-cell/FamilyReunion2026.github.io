import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
