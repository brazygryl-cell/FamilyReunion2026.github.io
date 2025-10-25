// nav.js
// Handles navigation bar, footer, and Netlify Identity auth (login/logout)

// Load Navbar & Footer
export function loadNavbar() {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

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

  if (footer) {
    footer.innerHTML = `
    <p>Made with by 
 <a href="#" id="emailLink">Taylor Clark Jones</a>
</p>

<script>
 const email = "taylor.clarkjones25@gmail.com";
 const subject = "Williams Family Reunion Registration";
 const body = "Hi Taylor,%0A%0AI'd like to register or learn more about the reunion.%0A%0AThanks,%0A[Your Name]";
 
 document.getElementById("emailLink").addEventListener("click", (e) => {
 e.preventDefault();

 // Try Gmail first
 const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${body}`;
 const win = window.open(gmailURL, "_blank");

 // If Gmail can't open, fallback to system email app
 setTimeout(() => {
 if (!win || win.closed || typeof win.closed === "undefined") {
 window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
 }
 }, 500);
 });
</script>
      <p>Art by Andre Clark</p>
    `;
  }
}

// Enable Logout Button Functionality
export function enableLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  // Make sure widget is ready
  if (!window.netlifyIdentity) {
    console.warn("Netlify Identity not loaded yet.");
    return;
  }

  logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    const user = window.netlifyIdentity.currentUser();
    if (user) {
      window.netlifyIdentity.logout();
    } else {
      alert("You are not logged in.");
    }
  });

  // When user logs out, return to login screen
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

  window.netlifyIdentity.on("init", user => {
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
