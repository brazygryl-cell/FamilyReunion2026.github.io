import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

const firebaseConfig = {
  apiKey: window.ENV.FIREBASE_API_KEY,
  authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
  projectId: window.ENV.FIREBASE_PROJECT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

signInAnonymously(auth).catch((err) => console.error("❌ Anonymous login failed:", err));
