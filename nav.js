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
        <a href="#" id="logoutBtn" style="color:#c33;font-weight:600">Logout</a>
      </nav>
    `;
  }

  // Footer
  if (footer) {
    footer.innerHTML = `
      <p>Made with ❤️ by 
        <a href="#" id="emailLink">Taylor Clark Jones</a>
      </p>
      <p>Art by Andre Clark</p>
    `;

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

        const popup = window.open(
          gmailURL,
          "gmailCompose",
          "width=700,height=600,left=" +
            (window.innerWidth / 2 - 350) +
            ",top=" +
            (window.innerHeight / 2 - 300)
        );

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

// Logout Button
export function enableLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.netlifyIdentity.currentUser()) {
      window.netlifyIdentity.logout();
    }
  });

  window.netlifyIdentity.on("logout", () => {
    window.location.href = "login.html";
  });
}

// Require Login (but do NOT loop)
export function requireAuth() {
  if (!window.netlifyIdentity) return;

  // If user is not logged in when identity initializes → go to login page
  window.netlifyIdentity.on("init", (user) => {
    if (!user && !window.location.pathname.includes("login.html")) {
      window.location.href = "login.html";
    }
  });

  // After login, reload once to activate Firestore token
  window.netlifyIdentity.on("login", () => {
    location.reload();
  });
}
// ✅ Sync Netlify Identity ↔ Firebase Auth
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", (user) => {
    if (user) {
      firebase.auth().signInWithCustomToken(user.token.access_token)
        .catch(err => console.error("Firebase login init error:", err));
    }
  });

  window.netlifyIdentity.on("login", (user) => {
    firebase.auth().signInWithCustomToken(user.token.access_token)
      .then(() => {
        console.log("✅ Firebase login success");
        location.reload();
      })
      .catch(err => console.error("Firebase login error:", err));
  });

  window.netlifyIdentity.on("logout", () => {
    firebase.auth().signOut().then(() => {
      console.log("👋 Logged out of Firebase too");
      location.reload();
    });
  });
}

