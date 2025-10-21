// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Only load config if it's running locally (not Netlify)
let firebaseConfig;

if (window.location.hostname === "localhost") {
 // Local development
 firebaseConfig = {
 apiKey: "AIzaSyAldYSp37LZO31XkGc4F1xhnQ9bpBXLU6Q",
 authDomain: "williams-reunion.firebaseapp.com",
 projectId: "williams-reunion",
 storageBucket: "williams-reunion.firebasestorage.app",
 messagingSenderId: "1053815265185",
 appId: "1:1053815265185:web:050db056f81ab9d2d81de0"
 };
} else {
 // Production: fetch securely from Firebase Functions
 const response = await fetch("/__/firebase/init.json");
 firebaseConfig = await response.json();
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };