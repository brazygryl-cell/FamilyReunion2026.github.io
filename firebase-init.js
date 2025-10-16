// firebase-init.js
import { firebaseConfig } from './firebase-config.js';

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
