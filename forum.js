import { db } from "./firebase-init.js";
import {
 collection,
 addDoc,
 serverTimestamp,
 query,
 orderBy,
 onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


// --- UI Elements ---
const postsBox = document.getElementById("postsBox");
const postInput = document.getElementById("postBody");
const boardSelect = document.getElementById("postBoard");
const postButton = document.getElementById("submitPost");

// --- Load Posts When Board Changes ---
boardSelect.addEventListener("change", loadPosts);

// --- Submit Post ---
postButton.addEventListener("click", async () => {
 const board = boardSelect.value;
 const text = postInput.value.trim();
 if (!text) return;

 try {
 await addDoc(collection(db, "forum", board, "posts"), {
 text,
 createdAt: serverTimestamp()
 });
 postInput.value = "";
 } catch (err) {
 console.error(" Add post failed:", err);
 alert("Could not post. Please try again.");
 }
});

// --- Load Posts from Firestore Live ---
function loadPosts() {
 const board = boardSelect.value;
 const postsRef = collection(db, "forum", board, "posts");
 const q = query(postsRef, orderBy("createdAt", "desc"));

 // Clear UI before reloading
 postsBox.innerHTML = "";

 onSnapshot(q, (snapshot) => {
 postsBox.innerHTML = ""; // Reset post list
 snapshot.forEach((doc) => {
 const post = doc.data();
 const div = document.createElement("div");
 div.className = "post";
 div.textContent = post.text;
 postsBox.appendChild(div);
 });
 });
}

// --- Load Default Board on Page Open ---
loadPosts();
