export async function handler() {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: process.env.FIREBASE_API_KEY,  // pulled from Netlify env
      authDomain: "williams-reunion.firebaseapp.com",
      projectId: "williams-reunion"
    })
  };
}
