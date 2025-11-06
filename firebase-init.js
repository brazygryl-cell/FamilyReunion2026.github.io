// firebase-init.js
const cfg = window.__FIREBASE_CONFIG__;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Initialize Firebase with the config injected at build time
const app = initializeApp(cfg);
export const db = getFirestore(app);
