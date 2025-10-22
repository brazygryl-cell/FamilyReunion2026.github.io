// nav.js
import { auth } from "./firebase-init.js";

// Dynamically load navbar into <header>
export function loadNavbar() {
  const header = document.querySelector("header");
  if (!header) return;

  header.innerHTML = `
    <nav class="navbar">
      <h1 class="logo">Williams Family Reunion 2026</h1>
      <p class="reunion-date">July 26 - August 1 • Orlando, FL</p>
      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="forum.html">Forum</a>
        <a href="event-details.html">Event Details</a>
        <a href="lodging.html">Lodging & Travel</a>
        <a href="payments.html">Payments & Deposits</a>
        <a href="directory.html">Family Directory</a>
        <a href="gallery.html">Photo Gallery</a>
        <a href="history.html">Family History</a>
        <a href="contact.html">Contact</a>
        <button id="logoutBtn" class="logout-btn">Logout</button>
      </div>
    </nav>
  `;

  // Highlight current page
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", async () => {
    try {
      await auth.signOut();
      alert("You’ve been logged out successfully.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

// Automatically load navbar when the page is loaded
document.addEventListener("DOMContentLoaded", loadNavbar);
