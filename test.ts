import { getAdminAuth } from "./lib/firebase/admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  try {
    console.log("Service Account Var:", process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    const auth = getAdminAuth();
    console.log("Got auth successfully");
  } catch (err) {
    console.error("Test failed:", err);
  }
}
test();
