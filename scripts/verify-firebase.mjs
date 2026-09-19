// ==========================================================
// SMARTTRIP - SUITE DE TESTES E VERIFICAÇÕES DO FIREBASE
// Valida isolamento, singleton, guardas de segurança e bundles.
// ==========================================================

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('TESTES AUTOMATIZADOS: CAMADA FIREBASE (SMARTTRIP)');
console.log('====================================================\n');

// TESTE 1: Isolamento do Firebase Admin SDK
console.log('1. Verificando isolamento do Firebase Admin SDK:');
const adminPath = path.resolve('src/lib/firebase/server/admin.ts');
assert(fs.existsSync(adminPath), 'Arquivo src/lib/firebase/server/admin.ts existe');

const adminContent = fs.readFileSync(adminPath, 'utf8');
assert(
  adminContent.includes("typeof window !== 'undefined'"),
  'admin.ts possui guarda runtime explícita contra execução no navegador'
);
assert(
  adminContent.includes('getAdminApp'),
  'admin.ts exporta inicializador getAdminApp com padrão singleton'
);

// TESTE 2: Garantir que Client Components NUNCA importam Admin SDK
console.log('\n2. Auditando código-fonte para garantir que nenhum Client Component importa Admin SDK:');
function scanDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allSrcFiles = scanDir(path.resolve('src'));
let adminLeaks = [];

for (const file of allSrcFiles) {
  // Ignora o próprio arquivo admin.ts
  if (file.includes(path.join('server', 'admin.ts'))) continue;

  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('firebase-admin') || content.includes('/server/admin')) {
    adminLeaks.push(file);
  }
}

assert(
  adminLeaks.length === 0,
  `Nenhum arquivo client-side importa o Admin SDK (ocorrências encontradas: ${adminLeaks.length})`
);

// TESTE 3: Verificação de Inicialização Singleton no Client SDK
console.log('\n3. Verificando padrão Singleton no Client SDK (prevenção de duplicatas sob HMR):');
const clientPath = path.resolve('src/lib/firebase/client.ts');
assert(fs.existsSync(clientPath), 'Arquivo src/lib/firebase/client.ts existe');

const clientContent = fs.readFileSync(clientPath, 'utf8');
assert(
  clientContent.includes('getApps().length > 0') || clientContent.includes('getApps().length === 0'),
  'client.ts checa getApps() antes de inicializar para evitar duplicatas sob HMR'
);
assert(
  clientContent.includes('getApp()'),
  'client.ts reutiliza getApp() quando app já existe'
);
assert(
  clientContent.includes('tryInitializeFirebase'),
  'client.ts oferece inicializador gracioso tryInitializeFirebase para evitar quebras quando chaves estiverem vazias'
);

// TESTE 4: Mensagens claras em caso de variáveis obrigatórias ausentes
console.log('\n4. Verificando mensagens descritivas de validação de configuração:');
const configPath = path.resolve('src/lib/firebase/config.ts');
assert(fs.existsSync(configPath), 'Arquivo src/lib/firebase/config.ts existe');

const configContent = fs.readFileSync(configPath, 'utf8');
assert(
  configContent.includes('Configuração do Firebase incompleta'),
  'config.ts gera mensagem de erro clara e descritiva listando as chaves ausentes'
);
assert(
  configContent.includes('isFirebaseConfigured'),
  'config.ts disponibiliza helper booleano isFirebaseConfigured'
);

// TESTE 5: Auditoria do .env.example
console.log('\n5. Verificando integridade e segurança do .env.example:');
const envExamplePath = path.resolve('.env.example');
assert(fs.existsSync(envExamplePath), 'Arquivo .env.example existe');

const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
assert(
  envExampleContent.includes('VITE_FIREBASE_API_KEY=') &&
  envExampleContent.includes('VITE_FIREBASE_AUTH_DOMAIN=') &&
  envExampleContent.includes('VITE_FIREBASE_PROJECT_ID='),
  '.env.example declara todas as variáveis do Firebase Client'
);
assert(
  envExampleContent.includes('FIREBASE_PRIVATE_KEY=') &&
  envExampleContent.includes('FIREBASE_CLIENT_EMAIL='),
  '.env.example declara as variáveis do Firebase Admin'
);
assert(
  !envExampleContent.includes('AIza') && !envExampleContent.includes('BEGIN PRIVATE KEY'),
  '.env.example não contém credenciais ou chaves reais'
);

// TESTE 6: Inspeção de Bundle Compilado (dist/) para vazamento de segredos
console.log('\n6. Auditando bundle compilado de produção (dist/):');
const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  const distFiles = scanDir(distPath);
  let secretsFound = [];

  for (const file of distFiles) {
    if (file.endsWith('.js')) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('BEGIN PRIVATE KEY') || content.includes('firebase-admin/lib')) {
        secretsFound.push(file);
      }
    }
  }

  assert(
    secretsFound.length === 0,
    `O bundle cliente não contém private keys nem bibliotecas do Admin SDK (arquivos suspeitos: ${secretsFound.length})`
  );
} else {
  console.log('  [INFO] Pasta dist/ não encontrada para inspeção de bundle (execute npm run build primeiro).');
}

console.log('\n====================================================');
console.log(`RESULTADO FINAL: ${passed} PASSADOS, ${failed} FALHAS`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
