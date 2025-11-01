export default function getFirebaseConfig() {
  if (!window.ENV) {
    console.error("❌ ENV not loaded", window.ENV);
    throw new Error("ENV not loaded yet");
  }

  return {
    apiKey: window.ENV.FIREBASE_API_KEY,
    authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
    projectId: window.ENV.FIREBASE_PROJECT_ID
  };
}
