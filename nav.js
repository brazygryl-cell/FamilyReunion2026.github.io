// nav.js
// Handles navigation bar, footer, and Netlify Identity auth (login/logout)

// Load Navbar & Footer
export function loadNavbar() {
 const header = document.querySelector("header");
 const footer = document.querySelector("footer");

 // Navbar
 if (header) {
 header.innerHTML = `
 <nav class="nav-links">
 <a href="index.html">Home</a>
 <a href="event-details.html">Event Details</a>
 <a href="lodging-travel.html">Lodging</a>
 <a href="forum.html">Forum</a>
 <a href="photo-gallery.html">Photo Gallery</a>
 <a href="family-history.html">Family History</a>
 <a href="#" id="logoutBtn" style="color:#c33;font-weight:600">Logout</a>
 </nav>
 `;
 }

 // Footer
 if (footer) {
 footer.innerHTML = `
 <p>Made with by 
 <a href="#" id="emailLink">Taylor Clark Jones</a>
 </p>
 <p>Art by Andre Clark</p>
 `;

 // Smart email handler with popup
 const emailLink = footer.querySelector("#emailLink");
 if (emailLink) {
 const email = "taylor.clarkjones25@gmail.com";
 const subject = "Williams Family Reunion Registration";
 const body =
 "Hi Taylor,%0A%0AI'd like to register or learn more about the reunion.%0A%0AThanks,%0A[Your Name]";

 emailLink.addEventListener("click", (e) => {
 e.preventDefault();

 const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(
 subject
 )}&body=${body}`;

 // Try opening Gmail in a small popup window
 const popup = window.open(
 gmailURL,
 "gmailCompose",
 "width=700,height=600,left=" +
 (window.innerWidth / 2 - 350) +
 ",top=" +
 (window.innerHeight / 2 - 300)
 );

 // Fallback if Gmail doesn't open
 setTimeout(() => {
 if (!popup || popup.closed || typeof popup.closed === "undefined") {
 window.location.href = `mailto:${email}?subject=${encodeURIComponent(
 subject
 )}&body=${body}`;
 }
 }, 600);
 });
 }
 }
}

// Enable Logout Button Functionality
export function enableLogout() {
 const logoutBtn = document.getElementById("logoutBtn");
 if (!logoutBtn) return;

 if (!window.netlifyIdentity) {
 console.warn("Netlify Identity not loaded yet.");
 return;
 }

 logoutBtn.addEventListener("click", (e) => {
 e.preventDefault();
 const user = window.netlifyIdentity.currentUser();
 if (user) {
 window.netlifyIdentity.logout();
 } else {
 alert("You are not logged in.");
 }
 });

 window.netlifyIdentity.on("logout", () => {
 window.location.href = "login.html";
 });
}

// Require Login (used on protected pages)
export function requireAuth() {
 if (!window.netlifyIdentity) {
 console.warn("Netlify Identity widget not loaded yet.");
 return;
 }

 window.netlifyIdentity.on("init", (user) => {
 if (!user) {
 window.netlifyIdentity.open("login");
 }
 });

 window.netlifyIdentity.on("login", () => {
 console.log(" Logged in!");
 });

 window.netlifyIdentity.on("logout", () => {
 console.log(" Logged out");
 window.location.href = "login.html";
 });
}
