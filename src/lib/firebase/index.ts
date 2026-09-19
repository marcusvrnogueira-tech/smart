// ==========================================================
// SMARTTRIP - EXPORTAÇÃO PÚBLICA DA CAMADA FIREBASE CLIENT
// Nota de Segurança: O módulo Admin SDK (server/admin.ts) NÃO é
// re-exportado aqui para evitar inclusão indevida no bundle cliente.
// ==========================================================

export {
  getFirebaseConfig,
  isFirebaseConfigured,
  validateFirebaseConfig,
} from './config';
export type { FirebaseClientConfig } from './config';

export {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  tryInitializeFirebase,
} from './client';
