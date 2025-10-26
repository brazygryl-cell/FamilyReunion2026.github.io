import admin from "firebase-admin";
import { readFileSync } from "fs";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync("./netlify/functions/service-account.json", "utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export const handler = async (event) => {
  // your forum logic here
};
