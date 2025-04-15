import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

const app = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();
export { db };
