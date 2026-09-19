// ==========================================================
// SMARTTRIP - CONFIGURAÇÃO E VALIDAÇÃO DO FIREBASE CLIENT
// Valida a presença das variáveis de ambiente públicas.
// ==========================================================

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

const requiredKeys: (keyof FirebaseClientConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
];

/**
 * Lê e retorna a configuração do Firebase Client a partir das variáveis públicas.
 * Suporta o prefixo padrão Vite (import.meta.env) e fallback para process.env.
 */
export function getFirebaseConfig(): FirebaseClientConfig {
  const env = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : (typeof process !== 'undefined' ? process.env : {}) as any;

  return {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
  };
}

/**
 * Verifica se todas as variáveis obrigatórias do Firebase Client estão preenchidas.
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return requiredKeys.every((key) => Boolean(config[key] && config[key].trim().length > 0));
}

/**
 * Valida a configuração e lança erro detalhado caso falte alguma chave obrigatória.
 */
export function validateFirebaseConfig(): FirebaseClientConfig {
  const config = getFirebaseConfig();
  const missingKeys = requiredKeys.filter(
    (key) => !config[key] || config[key].trim().length === 0
  );

  if (missingKeys.length > 0) {
    const formattedMissing = missingKeys
      .map((k) => `VITE_FIREBASE_${k.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`)
      .join(', ');

    throw new Error(
      `[SmartTrip Firebase Error] Configuração do Firebase incompleta. ` +
      `As seguintes variáveis obrigatórias estão ausentes no arquivo .env.local: ${formattedMissing}. ` +
      `Consulte docs/SPEC_FIREBASE.md e o arquivo .env.example para obter instruções de configuração.`
    );
  }

  return config;
}
