import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: cert(serviceAccount as admin.ServiceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`,
});

const db = getFirestore();
const bucket = admin.storage().bucket();
console.log(bucket.name)
export { db, bucket };
