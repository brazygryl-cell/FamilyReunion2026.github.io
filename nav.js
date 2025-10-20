// nav.js
export function loadNavbar() {
  const header = document.querySelector("header");
  header.innerHTML = `
    <h1>Williams Family Reunion 2026</h1>
    <p class="reunion-date">July 26 - August 1 • Orlando, FL</p>
    <nav>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="event.html">Event Details</a></li>
        <li><a href="lodging.html">Lodging & Travel</a></li>
        <li><a href="payments.html">Payments & Deposits</a></li>
        <li><a href="directory.html">Family Directory</a></li>
        <li><a href="gallery.html">Photo Gallery</a></li>
        <li><a href="history.html">Family History</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="forum.html">Forum</a></li>
      </ul>
    </nav>
  `;
}
