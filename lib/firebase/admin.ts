import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount(): ServiceAccount {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (!serviceAccountBase64) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable.");
  }

  try {
    const json = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    return JSON.parse(json) as ServiceAccount;
  } catch (error) {
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_BASE64: " + error);
  }
}

function ensureInitialized() {
  if (getApps().length === 0) {
    const serviceAccount = getServiceAccount();
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "plovo-56748",
    });
  }
}

export function getAdminDb() {
  ensureInitialized();
  return getFirestore();
}
export function getAdminAuth() {
  ensureInitialized();
  return getAuth();
}
