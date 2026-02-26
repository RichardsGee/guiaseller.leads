import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { env } from '../config/env.js';
import { readFileSync } from 'node:fs';

// Initialize only if we have credentials
let app;
try {
  if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Load service account from file path or JSON string
    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(readFileSync(env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf-8'));
    } catch {
      serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
    }

    app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    });
  } else {
    // Development mode — initialize without full credentials
    app = initializeApp({
      projectId: env.FIREBASE_PROJECT_ID,
      databaseURL: `https://${env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    });
    console.warn('⚠️  Firebase initialized without service account (limited functionality)');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export const firebaseAuth = app ? getAuth(app) : null;
export const firebaseDB = app ? getDatabase(app) : null;

export default { firebaseAuth, firebaseDB };
