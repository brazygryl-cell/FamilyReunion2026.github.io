// forum.js — Firebase-only version
import { auth, db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// DOM elements
const postsContainer = document.getElementById("posts");
const statusMessage = document.getElementById("postStatus");
const submitButton = document.getElementById("submitPost");
const postField = document.getElementById("postBody");
const form = document.getElementById("forumForm");

// Firestore collection
const postsCol = collection(db, "posts");

// Show feedback message
function showStatus(message = "", type = "") {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = `status-message${type ? " " + type : ""}`;
}

// Load posts from Firestore
async function loadPosts(user) {
  try {
    const q = query(postsCol, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    postsContainer.innerHTML = snapshot.empty ? "No posts yet." : "";

    snapshot.forEach((doc) => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <p>${data.message}</p>
        <span class="meta">— ${data.name || "Family Member"}, ${new Date(
          data.timestamp
        ).toLocaleString()}</span>
      `;
      postsContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load posts:", err);
    showStatus(`Could not load posts: ${err.message}`, "error");
  }
}

// Submit new post
async function postMessage(user) {
  const message = postField.value.trim();
  if (!message) {
    showStatus("Please write something before posting.", "info");
    return;
  }

  const nameInput = document.getElementById("posterName");
  const name = nameInput ? nameInput.value.trim() : "";

  try {
    submitButton.disabled = true;
    showStatus("Saving your post...", "info");

    await addDoc(postsCol, {
      name: name || "Family Member",
      email: user?.email || "anonymous",
      message,
      timestamp: Date.now(),
    });

    postField.value = "";
    if (nameInput) nameInput.value = "";
    showStatus("Post published!", "success");
    await loadPosts(user);
  } catch (err) {
    console.error("Failed to submit post:", err);
    showStatus(`Could not submit your post: ${err.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
}

// ✅ Listen to Firebase Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    form.style.display = "block";
    loadPosts(user);

    form.onsubmit = (e) => {
      e.preventDefault();
      postMessage(user);
    };
  } else {
    form.style.display = "none";
    postsContainer.textContent = "Please log in to view and post.";
  }
});
