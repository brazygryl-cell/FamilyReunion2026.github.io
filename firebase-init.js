const cfg = window.__FIREBASE_CONFIG__;
console.log("Firebase config used:", cfg);   // <— add this one line temporarily

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(cfg);
export const db = getFirestore(app);
