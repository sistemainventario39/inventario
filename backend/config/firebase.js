import { initializeApp, cert, getApps } from "firebase-admin/app";

import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: process.env.project_id,
  privateKeyId: process.env.private_key_id,
  privateKey: process.env.private_key.replace(/\\n/g, "\n"),
  clientEmail: process.env.client_email,
  clientId: process.env.client_id,
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientX509CertUrl: process.env.client_x509_cert_url,
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export { db, FieldValue, Timestamp };

export default db;
