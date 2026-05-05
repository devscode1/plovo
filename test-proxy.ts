import { adminAuth, adminDb } from "./lib/firebase/admin";

async function run() {
  try {
    console.log("adminAuth keys:", Object.keys(adminAuth));
    console.log("adminDb keys:", Object.keys(adminDb));
    console.log("adminAuth.verifyIdToken exists?", !!adminAuth.verifyIdToken);
    
    // Create a dummy token, it should fail with a specific error, not a proxy error
    await adminAuth.verifyIdToken("dummy-token");
  } catch (err) {
    console.error("Error calling verifyIdToken:", err);
  }
}

run();
