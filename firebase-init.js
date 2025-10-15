// firebase-init.js
import { firebaseConfig } from './firebase-config.js';

// These scripts need to be loaded in HTML (compat)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Export so other scripts can use
export { auth, db };
