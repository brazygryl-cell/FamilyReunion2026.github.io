// forum.js — Firebase-only version with comments
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

// Helper: label display
function displayLabel(name, email, currentEmail) {
  if (name) return name;
  if (email && email === currentEmail) return "You";
  return "Family Member";
}

// Load comments for a specific post
async function loadComments(postId, wrapperEl, currentEmail) {
  const commentsCol = collection(db, "posts", postId, "comments");
  const q = query(commentsCol, orderBy("timestamp", "asc"));
  const snap = await getDocs(q);

  const summary = wrapperEl.querySelector(".comment-summary");
  const list = wrapperEl.querySelector(".comments-list");

  summary.querySelector(".count").textContent = snap.size;
  list.innerHTML = "";

  snap.forEach((doc) => {
    const c = doc.data();
    const el = document.createElement("div");
    el.className = "comment";
    el.innerHTML = `
      <p>${c.message}</p>
      <span class="byline">— ${displayLabel(c.name, c.email, currentEmail)}, 
      ${new Date(c.timestamp).toLocaleString()}</span>
    `;
    list.appendChild(el);
  });
}

// Attach a comment UI to each post
function attachCommentUI(postCardEl, postId, currentUser) {
  const section = document.createElement("div");
  section.className = "comment-section";
  section.innerHTML = `
    <details>
      <summary class="comment-summary">
        <span>💬 Comments</span>
        <span class="count" aria-label="comment count">0</span>
      </summary>
      <div class="comments-body">
        <div class="comments-list"></div>
        <input class="comment-name" type="text" placeholder="Your name (optional)" maxlength="40" style="
          width:100%; background:#0f121a; border:1px solid var(--border);
          border-radius:8px; padding:8px 10px; color:var(--text);
          margin-bottom:8px; font-size:1.02rem;">
        <textarea class="comment-input" placeholder="Add a reply…"></textarea>
        <button class="send-comment" type="button">Send</button>
      </div>
    </details>
  `;
  postCardEl.appendChild(section);

  const detailsEl = section.querySelector("details");
  const sendBtn = section.querySelector(".send-comment");
  const input = section.querySelector(".comment-input");
  const nameField = section.querySelector(".comment-name");

  let firstOpenLoaded = false;
  detailsEl.addEventListener("toggle", async () => {
    if (detailsEl.open) {
      await loadComments(postId, section, currentUser?.email || "");
      firstOpenLoaded = true;
    }
  });

  sendBtn.addEventListener("click", async () => {
    const message = input.value.trim();
    const name = nameField.value.trim() || "Family Member";
    if (!message) return;

    const commentsCol = collection(db, "posts", postId, "comments");
    try {
      sendBtn.disabled = true;
      await addDoc(commentsCol, {
        name,
        email: currentUser?.email || "anonymous",
        message,
        timestamp: Date.now(),
      });

      // Update comment count immediately
      const summary = section.querySelector(".comment-summary");
      if (summary) {
        const countEl = summary.querySelector(".count");
        if (countEl) {
          const newCount = parseInt(countEl.textContent || "0", 10) + 1;
          countEl.textContent = newCount;
          countEl.style.transform = "scale(1.3)";
          countEl.style.transition = "transform 0.2s ease";
          setTimeout(() => (countEl.style.transform = "scale(1)"), 200);
        }
      }

      input.value = "";
      nameField.value = "";
      if (detailsEl.open || !firstOpenLoaded) {
        await loadComments(postId, section, currentUser?.email || "");
      }
    } catch (e) {
      console.error("Failed to add comment:", e);
      showStatus("Could not add comment. Please try again.", "error");
    } finally {
      sendBtn.disabled = false;
    }
  });
}

// Load all posts with attached comments
async function loadPosts(currentUser) {
  try {
    const q = query(postsCol, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    postsContainer.innerHTML = snapshot.empty ? "No posts yet." : "";

    snapshot.forEach(async (doc) => {
      const data = doc.data();
      const postEl = document.createElement("div");
      postEl.className = "post";
      if (data.email === (currentUser?.email || "")) postEl.classList.add("mine");

      postEl.innerHTML = `
        <p>${data.message}</p>
        <span class="meta">— ${displayLabel(
          data.name,
          data.email,
          currentUser?.email || ""
        )}, ${new Date(data.timestamp).toLocaleString()}</span>
      `;

      postsContainer.appendChild(postEl);
      attachCommentUI(postEl, doc.id, currentUser);

      // Immediately show comment count
      const commentsCol = collection(db, "posts", doc.id, "comments");
      const snap = await getDocs(commentsCol);
      const count = snap.size;
      const summary = postEl.querySelector(".comment-summary");
      if (summary) summary.querySelector(".count").textContent = count;
    });
  } catch (err) {
    console.error("Failed to load posts:", err);
    showStatus(`Could not load posts: ${err.message}`, "error");
  }
}

// Post new message
async function postMessage(user) {
  const message = postField.value.trim();
  const nameInput = document.getElementById("posterName");
  const name = nameInput?.value.trim() || "Family Member";

  if (!message) {
    showStatus("Please write something before posting.", "info");
    return;
  }

  try {
    submitButton.disabled = true;
    showStatus("Saving your post...", "info");

    await addDoc(postsCol, {
      name,
      email: user.email || "anonymous",
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

// ✅ Firebase auth listener
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
