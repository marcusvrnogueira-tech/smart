# Especificação Operacional de Inicialização e Reprodução (SmartTrip)

**Documento:** Especificação Operacional do Repositório (Standard Operating Procedure - Setup & Reproducibility)  
**ID do Documento:** SOP-ENV-001  
**Versão:** 1.0.0  
**Data:** 2026-09-19  
**Status:** Vigente / Obrigatório  
**Rastreabilidade:** Alinhado à [SPEC Mestre](../SPEC_MESTRE.md)  

---

## 1. Versão Mínima Esperada do Node.js

### 1.1 Critérios Verificáveis
* **Versão Mínima Estrita:** Node.js `>= 20.19.0` ou `>= 22.12.0` (LTS ativa recomendada: Node `22.x`).
* **Motivação Técnica:** O Vite 8.x, Rollup/Rolldown e os recursos modernos de compilação exigem compatibilidade com o motor V8 e APIs de criptografia/buffer dessas versões. O uso de versões inferiores a `20.19.0` emite avisos críticos de `EBADENGINE` ou falha na resolução de módulos ESM.
* **Arquivo de Fixação:**
  * O repositório deve conter um arquivo `.nvmrc` contendo apenas a string: `22`
  * O repositório deve conter um arquivo `.node-version` contendo: `22.12.0`
* **Definição de `engines` no `package.json`:**
  ```json
  "engines": {
    "node": "^20.19.0 || >=22.12.0",
    "npm": ">=10.8.0"
  }
  ```

---

## 2. Gerenciador de Pacotes e Determinismo

### 2.1 Critérios Verificáveis
* **Gerenciador Oficial:** `npm` (versão `>= 10.8.0`).
* **Trava de Dependências:** O arquivo `package-lock.json` (lockfile version 3) é **obrigatório** e deve ser versionado no Git.
* **Instalação em Ambientes de CI e Onboarding:**
  * Para reprodução exata e imutável de dependências, deve ser utilizado estritamente:
    ```bash
    npm ci
    ```
  * O comando `npm install` fica restrito à adição intencional ou atualização controlada de dependências por mantenedores.
* **Proibição de Outros Gerenciadores:** É terminantemente proibido versionar `yarn.lock`, `pnpm-lock.yaml` ou `bun.lockb` para evitar resolução bifurcada de dependências.

---

## 3. Scripts Obrigatórios no `package.json`

O `package.json` deve conter, no mínimo e sem alterações de nomenclatura, os seguintes comandos auditáveis:

| Script | Comando Padrão | Critério de Sucesso (Exit Code) | Propósito |
| :--- | :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Processo ativo / HTTP 200 em `http://localhost:3000` | Inicia o servidor de desenvolvimento local. |
| `npm run build` | `vite build` | Exit code `0` / Gera diretório `dist/` | Compila o bundle de produção estático/assets. |
| `npm run lint` | `tsc --noEmit` | Exit code `0` / 0 erros de compilação TypeScript | Checagem estática de tipos e integridade de código. |
| `npm run preview` | `vite preview --port=3000` | Processo ativo / Serve a pasta `dist/` gerada | Validação local do bundle de produção pré-deploy. |
| `npm run clean` | `rm -rf dist` (Linux/macOS) ou script multiplataforma | Exit code `0` | Limpeza de artefatos temporários de build. |

---

## 4. Estratégia de Variáveis de Ambiente (`.env.example` e `.env.local`)

### 4.1 Arquivo `.env.example` (Versionado no Git)
* **Critério Estrito:** Deve ser commitado no repositório e **não pode conter nenhum segredo, chave privada, token ou valor de produção**.
* **Formato Padronizado:** Deve declarar as chaves requeridas com comentários explicativos sobre onde obtê-las:
  ```env
  # ==========================================
  # SMARTTRIP - VARIÁVEIS DE AMBIENTE LOCAIS
  # ==========================================
  # Copie este arquivo para .env.local e preencha suas credenciais.
  # NUNCA comite o arquivo .env.local no Git.

  # Chave da API do Google Gemini (obter em: https://aistudio.google.com/app/apikey)
  GEMINI_API_KEY=

  # URL base da aplicação local (padrão: http://localhost:3000)
  APP_URL=http://localhost:3000

  # Configurações do Firebase Client (obter no Console do Firebase > Configurações do Projeto)
  VITE_FIREBASE_API_KEY=
  VITE_FIREBASE_AUTH_DOMAIN=
  VITE_FIREBASE_PROJECT_ID=
  VITE_FIREBASE_STORAGE_BUCKET=
  VITE_FIREBASE_MESSAGING_SENDER_ID=
  VITE_FIREBASE_APP_ID=
  ```

### 4.2 Arquivo `.env.local` (Local / Não Versionado)
* O arquivo `.env.local` é o destino final das chaves preenchidas pelo desenvolvedor.
* **Regra de Isolamento:** Nenhuma chave com privilégios administrativos (como `FIREBASE_ADMIN_PRIVATE_KEY`) pode ser prefixada com `VITE_`, garantindo que não vaze para o bundle Javascript público do cliente.

---

## 5. Regras de `.gitignore` e Proteção de Segredos

O arquivo `.gitignore` na raiz do projeto deve cobrir compulsoriamente:

```gitignore
# Dependências
node_modules/
.pnp/
.pnp.js

# Ambientes e Segredos (CRÍTICO)
.env
.env.*
!.env.example
*.pem
*.key
serviceAccountKey.json

# Builds e Distribuição
dist/
build/
out/
.next/

# Logs e Depuração
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Caches de Ferramentas
.cache/
.vite/
.eslintcache
.turbo/

# Arquivos do Sistema Operacional e IDEs
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
```

### 5.1 Critério de Auditoria de Segredos
* A execução do comando abaixo deve retornar resultado vazio (0 correspondências de arquivos rastreados):
  ```bash
  git ls-files | grep -E "\.env(\.local|\.production|\.development)?$"
  ```

---

## 6. Convenção de Branches

Para permitir colaboração fluida e rastreabilidade com a [SPEC Mestre](../SPEC_MESTRE.md):

### 6.1 Estrutura de Branches
* `main`: Código estável, testado e pronto para deploy automático na Vercel.
* `develop`: (Opcional se adotado Trunk-Based) Branch de integração de novas funcionalidades.
* **Branches Temáticas (Feature/Fix):**
  * `feat/US-XXX-descricao-curta`: Para histórias de usuário da SPEC (ex.: `feat/US-001-firebase-auth`).
  * `fix/RF-XXX-descricao-curta`: Para correção de bugs em requisitos funcionais (ex.: `fix/RF-008-weather-api-timeout`).
  * `chore/setup-infra`: Para tarefas operacionais e de configuração (ex.: `chore/SOP-001-setup-tooling`).
  * `docs/spec-update`: Para atualizações documentais.

---

## 7. Convenção de Commits

Adota-se estritamente o padrão **Conventional Commits v1.0.0** com inclusão obrigatória do identificador de rastreabilidade da SPEC:

### 7.1 Formato da Mensagem
```
<tipo>(<escopo>): <ID_SPEC> <descrição curta no imperativo>

[corpo explicativo opcional]

[referência opcional a issues]
```

### 7.2 Tipos Permitidos
* `feat`: Introdução de nova funcionalidade vinculada a uma História de Usuário (`US-xxx`) ou Requisito Funcional (`RF-xxx`).
* `fix`: Correção de defeito ou bug.
* `docs`: Alterações exclusivamente em arquivos de documentação (`README.md`, `docs/*.md`).
* `chore`: Alterações em build, configs de ferramentas ou dependências sem alteração de lógica.
* `test`: Adição ou correção de testes unitários, E2E ou de integração.
* `refactor`: Refatoração interna de código sem alteração de comportamento externo.

### 7.3 Exemplos Válidos
* `feat(auth): US-001 adicionar suporte a login com Google OAuth via Firebase`
* `feat(weather): RF-008 integrar busca de previsão climática via Open-Meteo`
* `chore(repo): SOP-001 configurar .gitignore e modelo .env.example`
* `docs(readme): atualizar guia de onboarding e comandos de instalacao`

---

## 8. Requisitos de Documentação para o README

O arquivo `README.md` principal do repositório deve ser auto-suficiente para possibilitar o chamado **"Onboarding de 5 Minutos"**. Ele deve conter, compulsoriamente:

1. **Título e Badges:** Nome do projeto (SmartTrip), status de build e versão do Node recomendada.
2. **Visão Geral Resumida:** 1 parágrafo explicando a proposta e o problema resolvido.
3. **Stack Tecnológica:** Tabela concisa listando Framework, Linguagem, IA, Autenticação, Banco de Dados e Hospedagem.
4. **Pré-requisitos:** Indicação clara de Node.js `>= 20.19.0` ou `22.x` e gerenciador `npm`.
5. **Guia Rápido Passo a Passo:**
   - Clone do repositório.
   - Instalação das dependências (`npm ci` ou `npm install`).
   - Configuração do arquivo `.env.local` a partir do `.env.example`.
   - Execução do servidor local (`npm run dev`).
6. **Tabela de Scripts Disponíveis:** Descrição de cada comando do `package.json`.
7. **Links para Especificações:** Links diretos para a [SPEC Mestre](SPEC_MESTRE.md) e demais documentos técnicos na pasta `docs/`.
8. **Solução de Problemas Comuns (Troubleshooting):** Resolução de conflitos de versão do Node, erros de porta ocupada (3000) e ausência de chaves.

---

## 9. Critérios para Considerar o Ambiente Reproduzível

O repositório é auditado como **100% Reproduzível** se, e somente se, atender aos 5 critérios abaixo:

* **CR-001 (Independência de Máquina / Clean-Room):** Clonar o repositório em uma máquina limpa ou container Docker sem histórico anterior e rodar `npm ci` deve instalar todas as dependências sem intervenção manual e com zero avisos de dependências conflitantes (`ERESOLVE`).
* **CR-002 (Integridade de Tipagem):** O comando `npm run lint` deve retornar exit code `0` sem necessidade de flags como `--skipLibCheck` abusivas ou supressões de erro não justificadas.
* **CR-003 (Compilação Bem-Sucedida):** O comando `npm run build` deve gerar os arquivos finais em `dist/` sem alertas de variáveis não resolvidas ou falhas de importação.
* **CR-004 (Zero Caminhos Absolutos):** Nenhum arquivo de código, script ou teste pode conter caminhos absolutos do sistema operacional do autor original (ex.: referências a `C:\Users\...` ou `/home/usuario/...`).
* **CR-005 (Isolamento de Secrets):** Uma cópia nova de `.env.example` para `.env.local` vazia deve permitir que a aplicação inicialize no modo de desenvolvimento, exibindo avisos amigáveis na UI sobre chaves ausentes sem travar o runtime com erro fatal de Javascript (*White Screen of Death*).

---

## 10. Checklist de Replicação (Onboarding para Novo Aluno)

Utilize este checklist binário (**Pass / Fail**) para validar a entrada de um novo colaborador ou aluno no projeto:

| Etapa | Ação | Verificação Esperada | Status |
| :---: | :--- | :--- | :---: |
| **1** | Executar `node -v` no terminal | Retorna `v20.19.0+` ou `v22.x.x` | [ ] Pass / [ ] Fail |
| **2** | Executar `npm -v` no terminal | Retorna `>= 10.8.0` | [ ] Pass / [ ] Fail |
| **3** | Clonar o repositório via Git | Repositório baixado sem perda de arquivos | [ ] Pass / [ ] Fail |
| **4** | Executar `npm ci` na raiz | Instala pacotes em `node_modules/` com exit code `0` | [ ] Pass / [ ] Fail |
| **5** | Copiar `.env.example` para `.env.local` | Arquivo `.env.local` criado na raiz do projeto | [ ] Pass / [ ] Fail |
| **6** | Validar que `.env.local` está no `.gitignore` | `git status` NÃO lista o arquivo `.env.local` | [ ] Pass / [ ] Fail |
| **7** | Executar `npm run lint` | Validador TypeScript executa sem acusar erros | [ ] Pass / [ ] Fail |
| **8** | Executar `npm run build` | Diretório `dist/` gerado com sucesso | [ ] Pass / [ ] Fail |
| **9** | Executar `npm run dev` | Servidor inicia na porta 3000 | [ ] Pass / [ ] Fail |
| **10**| Acessar `http://localhost:3000` no browser | Aplicação carrega interface inicial sem crash | [ ] Pass / [ ] Fail |
