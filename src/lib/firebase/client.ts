// ==========================================================
// SMARTTRIP - FIREBASE CLIENT SDK (SINGLETON)
// Inicializa com segurança App, Auth e Firestore no navegador.
// Previne duplicações sob Hot Module Replacement (HMR).
// ==========================================================

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFirebaseConfig, isFirebaseConfigured, validateFirebaseConfig } from './config';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

/**
 * Obtém ou inicializa a instância Singleton do Firebase App.
 * Garante que nenhuma instância duplicada seja criada em recargas HMR do Vite.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  const config = validateFirebaseConfig();
  firebaseApp = initializeApp(config);
  return firebaseApp;
}

/**
 * Obtém ou inicializa a instância Singleton do Firebase Authentication.
 */
export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    const app = getFirebaseApp();
    firebaseAuth = getAuth(app);
  }
  return firebaseAuth;
}

/**
 * Obtém ou inicializa a instância Singleton do Cloud Firestore.
 */
export function getFirebaseFirestore(): Firestore {
  if (!firestoreDb) {
    const app = getFirebaseApp();
    firestoreDb = getFirestore(app);
  }
  return firestoreDb;
}

/**
 * Inicialização segura e opcional: tenta inicializar caso as variáveis estejam presentes.
 * Retorna true se inicializado com sucesso, ou false se as variáveis ainda não foram configuradas.
 */
export function tryInitializeFirebase(): {
  success: boolean;
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  error?: string;
} {
  try {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        app: null,
        auth: null,
        db: null,
        error: 'Variáveis de ambiente do Firebase ainda não configuradas no .env.local.',
      };
    }

    const app = getFirebaseApp();
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    return { success: true, app, auth, db };
  } catch (err: any) {
    return {
      success: false,
      app: null,
      auth: null,
      db: null,
      error: err.message,
    };
  }
}
