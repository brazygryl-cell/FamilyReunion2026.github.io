#!/bin/bash
# create env file for client from Netlify env vars
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

# no-op build if you don't have a static build tool
# exit 0 so Netlify deploys the folder
exit 0
