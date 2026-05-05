import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount(): ServiceAccount {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountJson) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
  }

  try {
    const account: Record<string, string> = JSON.parse(serviceAccountJson);
    if (account.private_key) {
      account.private_key = account.private_key.replace(/\\n/g, '\n');
    }
    return account as ServiceAccount;
  } catch {
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
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
