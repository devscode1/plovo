import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

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

// Lazy getters – Firebase Admin is only initialized at runtime, not at import/build time
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;

const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_adminDb) {
      ensureInitialized();
      _adminDb = getFirestore();
    }
    const value = Reflect.get(_adminDb, prop);
    // Bind functions to the actual Firestore instance to preserve 'this' context
    return typeof value === "function" ? value.bind(_adminDb) : value;
  },
});

const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    if (!_adminAuth) {
      ensureInitialized();
      _adminAuth = getAuth();
    }
    const value = Reflect.get(_adminAuth, prop);
    // Bind functions to the actual Auth instance to preserve 'this' context
    return typeof value === "function" ? value.bind(_adminAuth) : value;
  },
});

export { adminDb, adminAuth };
