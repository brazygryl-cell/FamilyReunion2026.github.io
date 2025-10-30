export default function getFirebaseConfig() {
  return {
    apiKey: window._env_.FIREBASE_API_KEY, // ✅ comes from Netlify
    authDomain: "williams-reunion.firebaseapp.com",
    projectId: "williams-reunion"
  };
}
