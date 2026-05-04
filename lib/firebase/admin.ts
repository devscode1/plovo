import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getServiceAccount(): ServiceAccount {
  const path = require("path");
  const fs = require("fs");
  const filePath = path.join(process.cwd(), "plovo-56748-firebase-adminsdk-fbsvc-158ad41f8b.json");

  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountJson) {
    console.warn("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable. Using dummy credentials to prevent build failure.");
    return {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id",
      clientEmail: "dummy@dummy.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\ndummy\n-----END PRIVATE KEY-----\n",
    } as ServiceAccount;
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
    initializeApp({
      credential: cert(getServiceAccount()),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

initializeFirebaseAdmin();

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth };
