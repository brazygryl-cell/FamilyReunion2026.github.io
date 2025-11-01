import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = window.ENV;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => console.log("✅ Anonymous login successful"))
  .catch(err => console.error("❌ Anonymous login failed", err));

