// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

let app, db, auth;

async function initFirebase() {
  // 🔐 Fetch secure config from Netlify serverless function
  const res = await fetch("/.netlify/functions/firebase-config");
  if (!res.ok) {
    console.error("Failed to load Firebase config:", res.status);
    return;
  }

  const firebaseConfig = await res.json();

  // ✅ Initialize Firebase
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  console.log("✅ Firebase initialized successfully");
}

// Initialize immediately when imported
await initFirebase();

// Export for other files (like forum.js)
export { app, db, auth };
