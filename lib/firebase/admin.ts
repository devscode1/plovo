import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount(): ServiceAccount | null {
  const path = require("path");
  const fs = require("fs");
  const filePath = path.join(process.cwd(), "plovo-56748-firebase-adminsdk-fbsvc-158ad41f8b.json");

  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountJson) {
    console.warn("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Skipping Firebase Admin initialization.");
    return null;
  }

  let serviceAccount: ServiceAccount;

  if (serviceAccountJson.startsWith("{")) {
    serviceAccount = JSON.parse(serviceAccountJson);
  } else {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountJson, "utf8"));
  }

  return serviceAccount;
}

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = getServiceAccount();
    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }
}

initializeFirebaseAdmin();

const adminDb = (getApps().length > 0 ? getFirestore() : {}) as ReturnType<typeof getFirestore>;
const adminAuth = (getApps().length > 0 ? getAuth() : {}) as ReturnType<typeof getAuth>;

export { adminDb, adminAuth };
