import { getApps, initializeApp, cert, App } from "firebase-admin/app"
import { getFirestore, Firestore } from "firebase-admin/firestore"

let app: App | null = null;
let adminDb: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (adminDb) return adminDb;

  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
  }

  const serviceAccount = JSON.parse(credentialsJson);

  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApps()[0];
  }

  adminDb = getFirestore(app);
  return adminDb;
}