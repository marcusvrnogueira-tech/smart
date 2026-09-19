// ==========================================================
// SCRIPT DE DIAGNÓSTICO DE CONEXÃO REAL DO FIREBASE
// Testa conectividade direta com o Firebase Auth e Firestore
// ==========================================================

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

// Lê chaves do .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim();
  }
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKeyPrefix: firebaseConfig.apiKey?.slice(0, 10) + '...',
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testConnection() {
  console.log('\n--- 1. Testando chamada direta ao Firebase Auth ---');
  try {
    // Tenta autenticar usuário fictício para obter a resposta real do backend Firebase
    await signInWithEmailAndPassword(auth, 'teste_diag_999@smarttrip.com', 'senha_teste_123');
    console.log('Auth: Sucesso inesperado (usuário já existia)');
  } catch (err) {
    console.log('Auth Error Code:', err.code);
    console.log('Auth Error Message:', err.message);
    if (err.customData) {
      console.log('Auth Error CustomData:', err.customData);
    }
  }

  console.log('\n--- 2. Testando criação de conta de teste ---');
  try {
    await createUserWithEmailAndPassword(auth, 'teste_diag_999@smarttrip.com', 'senha_teste_123');
    console.log('Auth Register: Sucesso');
  } catch (err) {
    console.log('Register Error Code:', err.code);
    console.log('Register Error Message:', err.message);
  }

  console.log('\n--- 3. Testando leitura no Firestore ---');
  try {
    const snap = await getDoc(doc(db, 'users', 'test_user'));
    console.log('Firestore Read Exists:', snap.exists());
  } catch (err) {
    console.log('Firestore Error Code:', err.code);
    console.log('Firestore Error Message:', err.message);
  }
}

testConnection();
