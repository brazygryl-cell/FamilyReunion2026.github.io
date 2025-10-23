// nav.js
// Handles navbar, footer, and Netlify Identity authentication

// --- 🔹 Navbar + Footer HTML ---
const navbarHTML = `
  <nav class="navbar">
    <div class="logo">Williams Reunion 2026</div>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="event-details.html">Event Details</a></li>
      <li><a href="lodging-travel.html">Lodging</a></li>
      <li><a href="photo-gallery.html">Photo Gallery</a></li>
      <li><a href="family-history.html">Family History</a></li>
      <li><a href="forum.html">Communication</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button id="logoutBtn" class="logout-btn">Logout</button>
  </nav>
`;

const footerHTML = `
  <footer>
    <p>Made with ❤️ by Taylor Clark Jones</p>
    <p>Art by 🔥 Andre Clark</p>
  </footer>
`;

// --- 🔹 Insert Navbar and Footer ---
export function loadNavbar() {
  document.querySelector("header").innerHTML = navbarHTML;
  document.querySelector("footer").innerHTML = footerHTML;

  // Highlight the current page
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    const user = netlifyIdentity.currentUser();
    if (user) {
      netlifyIdentity.logout();
      alert("You have been logged out.");
      window.location.href = "login.html";
    }
  });
}

// --- 🔹 Require Login Protection ---
export function requireAuth() {
  if (!window.netlifyIdentity) {
    console.error("Netlify Identity not loaded!");
    return;
  }

  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

// --- 🔹 Initialize on Load ---
document.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
});
