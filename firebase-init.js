// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ✅ Public Firebase configuration (safe for client use)
const firebaseConfig = {
apiKey: "AIzaSyAldYSp37LZO31XkGc4F1xhnQ9bpBXLU6Q",
authDomain: "williams-reunion.firebaseapp.com",
projectId: "williams-reunion",
storageBucket: "williams-reunion.firebasestorage.app",
messagingSenderId: "1053815265185",
appId: "1:1053815265185:web:050db056f81ab9d2d81de0"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🗂️ Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// 🔁 Export for use in other scripts (login, forum, etc.)
export { db, auth };
