export default async function getFirebaseConfig() {
  const res = await fetch("/.netlify/functions/firebase-config");
  return await res.json();
}
