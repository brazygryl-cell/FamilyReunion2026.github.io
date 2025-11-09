import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5G9ZrrV62qx1DRNy_BdIImevD1IL2Grc",
  authDomain: "family-reunion-2026.firebaseapp.com",
  projectId: "family-reunion-2026",
  storageBucket: "family-reunion-2026.firebasestorage.app",
  messagingSenderId: "110890823431",
  appId: "1:110890823431:web:8048fe0322dfcc3f405fa2",
  measurementId: "G-M00J66WKGM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
