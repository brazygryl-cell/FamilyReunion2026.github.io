const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./service-account.json")),
  });
}

exports.handler = async (event, context) => {
  const token = event.headers.authorization?.split("Bearer ")[1];
  if (!token) return { statusCode: 401, body: "Missing Netlify token" };

  const decoded = await admin.auth().verifyIdToken(token);
  const customToken = await admin.auth().createCustomToken(decoded.sub);

  return {
    statusCode: 200,
    body: JSON.stringify({ customToken }),
  };
};
