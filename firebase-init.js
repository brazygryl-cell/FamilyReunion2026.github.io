// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAldYSp37LZO31XkGc4F1xhnQ9bpBXLU6Q",
  authDomain: "williams-reunion.firebaseapp.com",
  projectId: "williams-reunion",
  storageBucket: "williams-reunion.appspot.com",
  messagingSenderId: "1053815265185",
  appId: "1:1053815265185:web:YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
