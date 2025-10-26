import { db, auth } from "./firebase-init.js";
import {
  collection, addDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import {
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { loadNavbar, enableLogout } from "./nav.js";

// Initialize navbar/footer
document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();
  enableLogout();
  initForum();
});

const boards = ["general", "memories", "planning"];
let currentBoard = "general";

async function initForum() {
  const user = await waitForAuth();
  if (!user) return;
  setupBoardTabs();
  renderPosts(currentBoard);
  setupComposer();
}

function waitForAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).then(({ user }) => resolve(user));
      } else resolve(user);
    });
  });
}

function setupBoardTabs() {
  const tabs = document.querySelectorAll(".forum-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentBoard = tab.dataset.board;
      renderPosts(currentBoard);
    });
  });
}

function setupComposer() {
  const btn = document.getElementById("submitPost");
  const textarea = document.getElementById("postBody");
  btn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) return;

    const user = auth.currentUser;
    const postRef = collection(db, `forum_${currentBoard}`);
    await addDoc(postRef, {
      body: text,
      by: user.displayName || user.email,
      timestamp: Date.now(),
    });

    textarea.value = "";
  });
}

function renderPosts(board) {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = `<div class="empty">Loading posts...</div>`;

  const q = query(collection(db, `forum_${board}`), orderBy("timestamp", "desc"));
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";
    if (snapshot.empty) {
      postsContainer.innerHTML = `<div class="empty">No posts yet. Be the first to start a conversation!</div>`;
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const postEl = document.createElement("article");
      postEl.className = "post";
      postEl.innerHTML = `
        <div class="meta">${data.by || "Anonymous"} • ${formatDate(data.timestamp)}</div>
        <p class="body">${data.body}</p>
        <details class="replies-wrapper" open>
          <summary>💬 Replies</summary>
          <div class="replies" id="replies-${doc.id}"></div>
          <textarea class="reply-text" placeholder="Write a reply..."></textarea>
          <button class="send-reply" data-id="${doc.id}">Reply</button>
        </details>
      `;
      postsContainer.appendChild(postEl);
      loadReplies(board, doc.id);
    });

    document.querySelectorAll(".send-reply").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const postId = btn.dataset.id;
        const textarea = btn.previousElementSibling;
        const text = textarea.value.trim();
        if (!text) return;
        const user = auth.currentUser;

        await addDoc(collection(db, `forum_${board}/${postId}/replies`), {
          body: text,
          by: user.displayName || user.email,
          timestamp: Date.now(),
        });
        textarea.value = "";
      });
    });
  });
}

function loadReplies(board, postId) {
  const repliesContainer = document.getElementById(`replies-${postId}`);
  const q = query(collection(db, `forum_${board}/${postId}/replies`), orderBy("timestamp", "asc"));
  onSnapshot(q, (snapshot) => {
    repliesContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const replyEl = document.createElement("details");
      replyEl.className = "reply";
      replyEl.innerHTML = `
        <summary><strong>${data.by || "Anonymous"}</strong> • ${formatDate(data.timestamp)}</summary>
        <p>${data.body}</p>
      `;
      repliesContainer.appendChild(replyEl);
    });
  });
}

function formatDate(ts) {
  const date = new Date(ts);
  return date.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}
