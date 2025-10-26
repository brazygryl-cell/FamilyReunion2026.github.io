// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// ✅ Replace these with your real config values from Firebase console
const firebaseConfig = {
 const firebaseConfig = {
  apiKey: "AIzaSyAldYSp37LZO31XkGc4F1xhnQ9bpBXLU6Q",
  authDomain: "williams-reunion.firebaseapp.com",
  projectId: "williams-reunion",
  storageBucket: "williams-reunion.firebasestorage.app",
  messagingSenderId: "1053815265185",
  appId: "1:1053815265185:web:050db056f81ab9d2d81de0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
console.log("✅ Firebase initialized successfully");

