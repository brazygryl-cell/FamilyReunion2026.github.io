// nav.js
// nav.js
// Handles navigation bar, footer, and Netlify Identity auth (login/logout)
if (window.netlifyIdentity) {
window.netlifyIdentity.on("init", user => {
if (!user && !window.location.pathname.includes("login.html")) {
window.location.href = "login.html";
}
});
}

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
      const body = "Hi Taylor,%0A%0AI'd like to register or learn more about the reunion.%0A%0AThanks,%0A[Your Name]";

      emailLink.addEventListener("click", (e) => {
        e.preventDefault();
        const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${body}`;
        const popup = window.open(gmailURL, "gmailCompose", "width=700,height=600");

        setTimeout(() => {
          if (!popup || popup.closed) {
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
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

// ✅ Require Login on *every* page except login.html
export function requireAuth() {
  if (!window.netlifyIdentity) return;

  const user = window.netlifyIdentity.currentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
}

// Restore footer email popup behavior (universal mobile + desktop fix)
export function setupEmailPopup() {
  const emailLink = document.querySelector("#emailLink");
  if (!emailLink) return;

  const email = "taylor.clarkjones25@gmail.com";
  const subject = "Williams Family Reunion Registration";
  const body = `Hi Taylor,

I'd like to register or learn more about the reunion.

Thanks,
[Your Name]`;

  emailLink.addEventListener("click", (e) => {
    e.preventDefault();

    // Properly encode subject/body for URLs
    const encSubj = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encSubj}&body=${encBody}`;
    const mailtoURL = `mailto:${email}?subject=${encSubj}&body=${encBody}`;

    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid;

    if (isMobile) {
      // 📱 For mobile, Gmail app often strips params unless URL encoded carefully
      if (isAndroid) {
        // Android Gmail app handles mailto: correctly
        window.location.href = mailtoURL;
      } else if (isIOS) {
        // iOS Mail sometimes ignores body — use short delay hack
        setTimeout(() => {
          window.location.href = mailtoURL;
        }, 100);
      }
    } else {
      // 💻 Desktop Gmail popup
      const popup = window.open(
        gmailURL,
        "gmailCompose",
        `width=700,height=600,left=${window.innerWidth / 2 - 350},top=${
          window.innerHeight / 2 - 300
        }`
      );

      // Fallback if blocked
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        window.location.href = mailtoURL;
      }
    }
  });
}
