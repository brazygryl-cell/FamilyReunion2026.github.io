// nav.js
import { auth } from './firebase-init.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

const nav = document.querySelector('nav');
nav.innerHTML = `
  <a href="index.html">Home</a>
  <a href="forum.html">Forum</a>
  <a href="events.html">Event Details</a>
  <a href="lodging.html">Lodging & Travel</a>
  <a href="payments.html">Payments</a>
  <a href="directory.html">Family Directory</a>
  <a href="gallery.html">Photo Gallery</a>
  <a href="history.html">Family History</a>
  <a href="contact.html">Contact</a>
  <a id="auth-btn" href="#">Login</a>
`;

const authBtn = document.getElementById('auth-btn');

// Listen for auth state
auth.onAuthStateChanged(user => {
  if (user) {
    authBtn.textContent = 'Logout';
    authBtn.onclick = async e => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = 'login.html';
    };
  } else {
    authBtn.textContent = 'Login';
    authBtn.onclick = e => {
      e.preventDefault();
      window.location.href = 'login.html';
    };
  }
});

