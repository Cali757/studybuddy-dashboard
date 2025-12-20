// lib/firebaseAdmin.ts
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : {
        type: "service_account",
        project_id: process.env.GCP_PROJECT_ID,
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();
export { db as adminDb };
