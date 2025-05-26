import { cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const serviceAccountBase64 = process.env.FIREBASE_KEY_B64;
if (!serviceAccountBase64) throw new Error("Missing FIREBASE_KEY_B64");

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
);

admin.initializeApp({
  credential: cert(serviceAccount as admin.ServiceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`,
});

const db = getFirestore();
const bucket = admin.storage().bucket();
export { db, bucket };
