#!/bin/bash
# --- Create env.js from Netlify environment variables ---
cat > ./env.js <<EOF
window.__FIREBASE_CONFIG__ = {
  apiKey: "${FIREBASE_API_KEY}",
  authDomain: "${FIREBASE_AUTH_DOMAIN}",
  projectId: "${FIREBASE_PROJECT_ID}",
  storageBucket: "${FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${FIREBASE_APP_ID}"
};
EOF

# make sure we exit cleanly
exit 0
