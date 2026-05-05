import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

import fs from "fs";
import path from "path";

function getServiceAccount(): ServiceAccount {
  let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountJson) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
  }

  // If it's a file path (ends with .json), read the file contents
  if (serviceAccountJson.trim().endsWith(".json")) {
    try {
      const fullPath = path.resolve(process.cwd(), serviceAccountJson.trim());
      serviceAccountJson = fs.readFileSync(fullPath, "utf8");
    } catch (err) {
      throw new Error(`Failed to read FIREBASE_SERVICE_ACCOUNT_KEY file at ${serviceAccountJson}`);
    }
  }

  try {
    const account: Record<string, string> = JSON.parse(serviceAccountJson);
    if (account.private_key) {
      account.private_key = account.private_key
        .replace(/\\n/g, '\n')
        .replace(/\r/g, '')
        .trim();
    }
    return account as ServiceAccount;
  } catch (err) {
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string");
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
