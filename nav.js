// nav.js
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
        <a href="#" id="authBtn" style="font-weight:600">Login</a>
      </nav>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <p>Made with ❤️ by 
      <a href="#" id="emailLink">Taylor Clark Jones</a></p>
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

// Handle Netlify Identity Login/Logout
export function initAuth() {
  const authBtn = document.getElementById("authBtn");

  if (!window.netlifyIdentity) {
    console.warn("Netlify Identity not loaded.");
    return;
  }

  // Replace button text based on user state
  window.netlifyIdentity.on("init", (user) => {
    if (user && authBtn) authBtn.textContent = "Logout";
  });

  window.netlifyIdentity.on("login", (user) => {
    if (authBtn) authBtn.textContent = "Logout";
  });

  window.netlifyIdentity.on("logout", () => {
    if (authBtn) authBtn.textContent = "Login";
  });

  // Button click toggles login/logout
  authBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    const user = window.netlifyIdentity.currentUser();
    if (user) {
      window.netlifyIdentity.logout();
    } else {
      window.netlifyIdentity.open();
    }
  });
}

}

