// ==========================================================
// SMARTTRIP - FIREBASE ADMIN SDK (SERVER-SIDE ONLY)
// Inicialização com privilégios administrativos para Node.js / Serverless.
// NUNCA DEVE SER IMPORTADO OU EXECUTADO NO NAVEGADOR.
// ==========================================================

import * as admin from 'firebase-admin';

// Guarda estrita de segurança contra execução no cliente
if (typeof window !== 'undefined') {
  throw new Error(
    '[Security Violation] O módulo Firebase Admin SDK foi importado no ambiente do cliente (navegador). ' +
    'Este módulo utiliza credenciais privilegiadas e deve ser executado exclusivamente no servidor.'
  );
}

export interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Lê e valida as credenciais de servidor a partir de process.env.
 */
function getAdminCredentials(): FirebaseAdminConfig {
  const projectId = process.env.FIREBASE_PROJECT_ID || '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

  const missing: string[] = [];
  if (!projectId) missing.push('FIREBASE_PROJECT_ID');
  if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');

  if (missing.length > 0) {
    throw new Error(
      `[SmartTrip Firebase Admin Error] Credenciais administrativas incompletas. ` +
      `Variáveis de servidor ausentes: ${missing.join(', ')}. ` +
      `Essas credenciais devem ser configuradas exclusivamente no ambiente seguro do servidor.`
    );
  }

  // Normaliza quebras de linha em chaves privadas PEM
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return { projectId, clientEmail, privateKey };
}

/**
 * Obtém ou inicializa a instância Singleton do Firebase Admin App.
 */
export function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const { projectId, clientEmail, privateKey } = getAdminCredentials();

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

/**
 * Obtém a instância de Auth administrativo.
 */
export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

/**
 * Obtém a instância do Firestore administrativo.
 */
export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}
