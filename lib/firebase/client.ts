import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgBnKVHST4h1YgVU8a5qf052Stz-vVYpw",
  authDomain: "plovo-56748.firebaseapp.com",
  projectId: "plovo-56748",
  storageBucket: "plovo-56748.firebasestorage.app",
  messagingSenderId: "700641536184",
  appId: "1:700641536184:web:f9a07046ccbbeab44d6c4d",
  measurementId: "G-EGVLWG2NT0",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
