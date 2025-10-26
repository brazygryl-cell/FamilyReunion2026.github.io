// forum.js
import { db, auth } from "./firebase-init.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

import { loadNavbar, loadFooter } from "./nav.js";

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  loadFooter();
  console.log("✅ Forum initialized");
  setupForum();
});

function setupForum() {
  const postsEl = document.getElementById("posts");
  const tabs = document.querySelectorAll(".forum-tab");
  const textarea = document.getElementById("postBody");
  const boardSelect = document.getElementById("postBoard");
  const postBtn = document.getElementById("submitPost");

  let currentBoard = "general";

  // Render posts from Firestore
  function renderPosts(board) {
    postsEl.innerHTML = `<p style="text-align:center;color:#aaa">Loading ${board}...</p>`;
    const ref = collection(db, `forum_${board}`);
    const q = query(ref, orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
      postsEl.innerHTML = "";
      if (snapshot.empty) {
        postsEl.innerHTML = `<div class="empty">No posts yet in ${board}.</div>`;
        return;
      }
      snapshot.forEach((doc) => {
        const p = doc.data();
        const card = document.createElement("div");
        card.className = "post";
        card.innerHTML = `
          <div class="meta">${p.by || "Unknown"} • ${p.createdAt?.toDate().toLocaleString() || ""}</div>
          <div class="title">${p.title || "(untitled)"}</div>
          <p class="body">${p.body}</p>
        `;
        postsEl.appendChild(card);
      });
    });
  }

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentBoard = tab.dataset.board;
      boardSelect.value = currentBoard;
      renderPosts(currentBoard);
    });
  });

  // Post new message
  postBtn.addEventListener("click", async () => {
    const text = textarea.value.trim();
    if (!text) return alert("Write something first!");
    try {
      const ref = collection(db, `forum_${boardSelect.value}`);
      await addDoc(ref, {
        title: "New Post",
        body: text,
        by: auth.currentUser?.email || "Anonymous",
        createdAt: serverTimestamp()
      });
      textarea.value = "";
      renderPosts(boardSelect.value);
    } catch (err) {
      console.error("Error posting:", err);
      alert("Could not post right now. Try again.");
    }
  });

  renderPosts(currentBoard);
}
