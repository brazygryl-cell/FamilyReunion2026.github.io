// forum.js
import { app, db } from './firebase-init.js';
import { 
  collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { loadNavbar, enableLogout, requireAuth } from './nav.js';

// Load nav + footer once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadNavbar();
  enableLogout();
  requireAuth();
});

// --- Forum logic ---
const postsEl = document.getElementById('posts');
const tabs = document.querySelectorAll('.forum-tabs button');
const newPostBtn = document.getElementById('newPost');
let currentBoard = 'general';
let unsubscribe = null;

// Load posts for board
function loadPosts(board) {
  if (unsubscribe) unsubscribe();
  postsEl.innerHTML = '<p style="text-align:center;color:var(--muted)">Loading posts…</p>';
  const q = query(collection(db, 'forum_posts'), where('board', '==', board), orderBy('createdAt', 'desc'));
  unsubscribe = onSnapshot(q, snap => {
    postsEl.innerHTML = '';
    if (snap.empty) {
      postsEl.innerHTML = '<p style="text-align:center;color:var(--muted)">No posts yet.</p>';
      return;
    }
    snap.forEach(doc => renderPost(doc.id, doc.data()));
  });
}

function renderPost(id, post) {
  const div = document.createElement('div');
  div.className = 'post';
  div.innerHTML = `
    <div class="title">${escapeHtml(post.title)}</div>
    <div class="meta">${escapeHtml(post.authorName || 'Anonymous')} • ${formatTime(post.createdAt)}</div>
    <div class="body">${escapeHtml(post.body)}</div>`;
  postsEl.appendChild(div);
}

// Create post
newPostBtn.addEventListener('click', async () => {
  const user = window.netlifyIdentity?.currentUser();
  if (!user) return window.netlifyIdentity?.open('login');
  const title = prompt('Post title:');
  const body = prompt('Message:');
  if (!title || !body) return;

  await addDoc(collection(db, 'forum_posts'), {
    board: currentBoard,
    title,
    body,
    authorName: user.user_metadata.full_name || user.email,
    createdAt: serverTimestamp()
  });
});

// Switch boards
tabs.forEach(t => {
  t.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    t.classList.add('active');
    currentBoard = t.dataset.board;
    loadPosts(currentBoard);
  });
});

// Helpers
function formatTime(ts) {
  if (!ts?.seconds) return 'just now';
  return new Date(ts.seconds * 1000).toLocaleString();
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])
  );
}

// Start
loadPosts(currentBoard);
