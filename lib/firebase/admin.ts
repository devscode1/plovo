import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount(): ServiceAccount | null {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountJson) {
    console.warn("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Skipping Firebase Admin initialization.");
    return null;
  }

  try {
    return JSON.parse(serviceAccountJson) as ServiceAccount;
  } catch {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
    return null;
  }
}

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = getServiceAccount();
    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "plovo-56748",
      });
    }
  }
}

initializeFirebaseAdmin();

const adminDb = (getApps().length > 0 ? getFirestore() : null) as ReturnType<typeof getFirestore> | null;
const adminAuth = (getApps().length > 0 ? getAuth() : null) as ReturnType<typeof getAuth> | null;

export { adminDb, adminAuth };
