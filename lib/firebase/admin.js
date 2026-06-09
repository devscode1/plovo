"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminDb = getAdminDb;
exports.getAdminAuth = getAdminAuth;
var app_1 = require("firebase-admin/app");
var firestore_1 = require("firebase-admin/firestore");
var auth_1 = require("firebase-admin/auth");
function getServiceAccount() {
    var serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    if (!serviceAccountBase64) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable.");
    }
    try {
        var json = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
        return JSON.parse(json);
    }
    catch (error) {
        throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_BASE64: " + error);
    }
}
function ensureInitialized() {
    if ((0, app_1.getApps)().length === 0) {
        var serviceAccount = getServiceAccount();
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "plovo-56748",
        });
    }
}
function getAdminDb() {
    ensureInitialized();
    return (0, firestore_1.getFirestore)();
}
function getAdminAuth() {
    ensureInitialized();
    return (0, auth_1.getAuth)();
}
