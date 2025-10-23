<!-- put this file in your repo root as nav.js -->
<script type="module">
// Build header/footer and simple auth UI via Netlify Identity
const headerEl = document.querySelector("header");
const footerEl = document.querySelector("footer");

const links = [
  { href: "index.html", label: "Home" },
  { href: "event-details.html", label: "Event Details" },
  { href: "lodging-travel.html", label: "Lodging & Travel" },
  { href: "payments.html", label: "Payments" },
  { href: "family-directory.html", label: "Directory" },
  { href: "photo-gallery.html", label: "Photos" },
  { href: "family-history.html", label: "Family History" },
  { href: "contact.html", label: "Contact" }
];

function navHTML(){
  const current = location.pathname.split("/").pop() || "index.html";
  const items = links.map(l => {
    const active = current === l.href ? "active" : "";
    return `<a class="${active}" href="${l.href}">${l.label}</a>`;
  }).join("");

  return `
  <header class="site-header">
    <nav class="navbar">
      <div class="brand">
        <div class="logo">W</div>
        <div class="title">Williams Reunion</div>
      </div>
      <div class="nav-links">${items}</div>
      <div class="auth-actions">
        <button id="btnLogin" class="btn ghost">Login</button>
        <button id="btnLogout" class="btn">Logout</button>
      </div>
    </nav>
  </header>`;
}

function footerHTML(){
  return `
  <footer class="site-footer">
    <div class="container">
      <div>Made with ❤️ by Taylor Clark Jones — Art by 🔥 Andre Clark</div>
    </div>
  </footer>`;
}

if(headerEl) headerEl.outerHTML = navHTML();
if(footerEl) footerEl.outerHTML = footerHTML();

// Wire up Identity buttons
function wireAuthUI(){
  const loginBtn = document.getElementById("btnLogin");
  const logoutBtn = document.getElementById("btnLogout");

  const uiRefresh = (user)=>{
    if(!loginBtn || !logoutBtn) return;
    if(user){
      loginBtn.style.display="none";
      logoutBtn.style.display="inline-flex";
    }else{
      loginBtn.style.display="inline-flex";
      logoutBtn.style.display="none";
    }
  }

  if(window.netlifyIdentity){
    window.netlifyIdentity.on("init", uiRefresh);
    window.netlifyIdentity.on("login", (user)=>{
      uiRefresh(user);
      // optional: after login, send to home
      if(location.pathname.endsWith("login.html")) location.href="index.html";
    });
    window.netlifyIdentity.on("logout", ()=>{
      uiRefresh(null);
      // optional: after logout, send to login page
      location.href="login.html";
    });
  }

  if(loginBtn){
    loginBtn.addEventListener("click", ()=>{
      if(window.netlifyIdentity) window.netlifyIdentity.open();
      else alert("Identity not loaded.");
    });
  }
  if(logoutBtn){
    logoutBtn.addEventListener("click", ()=>{
      if(window.netlifyIdentity) window.netlifyIdentity.logout();
    });
  }
}
wireAuthUI();

// Simple page guard: call requireAuth() on pages you want private
export function requireAuth(){
  if(!window.netlifyIdentity){
    // wait for widget to load, then check
    document.addEventListener("DOMContentLoaded", ()=>{
      setTimeout(() => {
        const user = window.netlifyIdentity && window.netlifyIdentity.currentUser();
        if(!user) location.href = "login.html";
      }, 50);
    });
    return;
  }
  const user = window.netlifyIdentity.currentUser();
  if(!user) location.href="login.html";
}
</script>
