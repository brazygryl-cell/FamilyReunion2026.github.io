// forum.js
import { db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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
async function loadPosts() {
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
        <span class="meta">— ${data.email}, ${new Date(data.timestamp).toLocaleString()}</span>
      `;
      postsContainer.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load posts:", err);
    showStatus(`Could not load posts: ${err.message}`, "error");
  }
}

// Submit new post
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = postField.value.trim();
  if (!message) {
    showStatus("Please write something before posting.", "info");
    return;
  }

  const user =
    window.netlifyIdentity && window.netlifyIdentity.currentUser();
  const email = user ? user.email : "anonymous";

  try {
    submitButton.disabled = true;
    showStatus("Saving your post...", "info");

    await addDoc(postsCol, {
      email,
      message,
      timestamp: Date.now(),
    });

    postField.value = "";
    showStatus("Post published!", "success");
    loadPosts();
  } catch (err) {
    console.error("Failed to submit post:", err);
    showStatus(`Could not submit your post: ${err.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
});

// Load posts on page load
loadPosts();
