<!-- firebase-init.js -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
  import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

  const firebaseConfig = window.__ENV?.FIREBASE_CONFIG; // from env.js
  const app = initializeApp(firebaseConfig);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // make available to other modules
  export { app, db, auth, provider };
</script>
