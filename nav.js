// nav.js
import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

/* ------------------------------------------------------
 🧭 Load Navbar + Footer
------------------------------------------------------ */
export function loadNavbar() {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  // 🧩 Navbar
  if (header) {
    header.innerHTML = `
      <nav class="nav-links">
        <a href="index.html">Home</a>
        <a href="event-details.html">Event Details</a>
        <a href="lodging-travel.html">Lodging</a>
        <a href="forum.html">Forum</a>
        <a href="photo-gallery.html">Photo Gallery</a>
        <a href="#" id="logoutBtn" style="color:#c33;font-weight:600">Logout</a>
      </nav>
    `;
  }

  // 🧩 Footer
  if (footer) {
    footer.innerHTML = `
      <p style="margin-bottom:8px;">
        Made with ❤️ by <strong>Taylor Clark Jones</strong><br>
        <span style="font-size:0.95rem; color:var(--muted);">
          📧 Email ShaSha:
          <a href="#" id="emailLink" class="email-link">
            familyreunionwilliams2026@gmail.com
          </a>
        </span>
      </p>
      <p>Art by Andre Clark</p>
    `;
  }

  enableLogout();     // attach logout handler
  setupEmailPopup();  // re-attach popup logic
}

/* ------------------------------------------------------
 🔒 Firebase Logout
------------------------------------------------------ */
export function enableLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      window.location.href = "login.html";
    }
  });
}

/* ------------------------------------------------------
 🔐 Auth Gate (Protects all pages except login.html)
------------------------------------------------------ */
export function requireAuthFirebase() {
  if (window.location.pathname.includes("login.html")) return;
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

/* ------------------------------------------------------
 📧 Unified Email Popup (desktop Gmail + mobile mailto)
------------------------------------------------------ */
export function setupEmailPopup() {
  const emailLink = document.querySelector("#emailLink");
  if (!emailLink) return;

  const email = "familyreunionwilliams2026@gmail.com";
  const subject = "Williams Family Reunion Questions";
  const body =
    "Hi ShaSha,%0A%0AI'd like to learn more about the reunion.%0A%0AThanks,%0A[Your Name]";

  emailLink.addEventListener("click", (e) => {
    e.preventDefault();

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
      subject
    )}&body=${body}`;
    const mailtoURL = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${body}`;

    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid;

    if (isMobile) {
      // 📱 Mobile: open mail app
      window.location.href = mailtoURL;
    } else {
      // 💻 Desktop: try Gmail popup first
      const popup = window.open(
        gmailURL,
        "gmailCompose",
        `width=700,height=600,left=${window.innerWidth / 2 - 350},top=${
          window.innerHeight / 2 - 300
        }`
      );

      // Fallback if Gmail popup blocked or fails
      setTimeout(() => {
        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          window.location.href = mailtoURL;
        }
      }, 500);
    }
  });
}
