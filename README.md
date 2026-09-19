# SmartTrip ✈️

> Assistente Inteligente de Viagens centrado na filosofia *"IA propõe, o humano dispõe"*, integrando previsão meteorológica em tempo real, geolocalização e geração contextual de itinerários com Google Gemini.

---

## 📋 Especificações e Documentação do Projeto

Todas as decisões arquiteturais, de produto e de interface estão documentadas com IDs rastreáveis na pasta [`docs/`](docs/):

- 📘 [**SPEC Mestre (Visão, Personas, Requisitos, Arquitetura)**](SPEC_MESTRE.md)
- ⚙️ [**SPEC Operacional (Setup, Git, Convenções e Reprodutibilidade)**](docs/SPEC_OPERACIONAL.md)
- 🎨 [**SPEC de Interface (Telas, Rotas, Componentes e Contratos)**](docs/SPEC_INTERFACE.md)
- 🔥 [**SPEC do Firebase (Auth, Firestore, Security Rules e Singletons)**](docs/SPEC_FIREBASE.md)
- 🔐 [**SPEC de Autenticação (Fluxos de Auth, Zero-Trust, RBAC e Isolamento)**](docs/SPEC_AUTH.md)
- 🗄️ [**SPEC de Modelagem Firestore (Coleções, Schemas, Índices e Autorização)**](docs/SPEC_FIRESTORE_DATA_MODEL.md)
- 🗓️ [**SPEC Conjunta: Folgas & Preferências (Validações, Conflitos e UX)**](docs/SPEC_DISPONIBILIDADE_PREFERENCIAS.md)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion |
| **Build & Tooling** | Vite 8, Rollup/Rolldown, ESLint, TypeScript Compiler (`tsc`) |
| **Inteligência Artificial** | Google Gemini API (`gemini-2.5-flash` via `@google/genai`) |
| **Dados Meteorológicos** | Open-Meteo API |
| **Autenticação & Banco** | Firebase Authentication & Cloud Firestore (Google Cloud) |
| **Hospedagem & Deploy** | Vercel Serverless Platform |

---

## 🚀 Guia Rápido de Instalação e Execução (Onboarding de 5 Minutos)

### 1. Pré-requisitos
- **Node.js:** Versão `>= 20.19.0` ou `>= 22.12.0` (LTS recomendada: `Node 22.x`).
- **NPM:** Versão `>= 10.8.0`.

Verifique no terminal:
```bash
node -v
npm -v
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e configure suas chaves no `.env.local`:
```bash
cp .env.example .env.local
```
> **Nota de Segurança:** O arquivo `.env.local` é ignorado pelo Git e nunca deve ser commitado.

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:3000`.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento na porta 3000. |
| `npm run build` | Compila os arquivos de produção para a pasta `dist/`. |
| `npm run preview` | Executa localmente o bundle compilado em `dist/`. |
| `npm run lint` | Valida tipagem estática e integridade com o TypeScript (`tsc --noEmit`). |
| `npm run clean` | Remove a pasta temporária de compilação `dist/`. |

---

## 🧭 Rotas da Aplicação (MVP)

- `/` — Landing page institucional e apresentação da proposta de valor.
- `/login` — Autenticação por e-mail/senha e Google OAuth.
- `/register` — Cadastro de novo usuário.
- `/dashboard` — Painel central com próxima viagem e atalhos rápidos.
- `/profile` — Edição de dados pessoais, cidade base e preferências de viagem.
- `/availability` — Gerenciamento de períodos de folga e feriados prolongados.
- `/explore` — Busca de destino, previsão do clima e gerador com IA.
- `/trips` — Listagem, busca e exclusão de viagens salvas.
- `/trips/:id` — Visualização completa e revisão humana interativa do itinerário.

---

## 🛡️ Segurança e Boas Práticas
- Nenhuma chave de API ou credencial sensível é exposta no cliente público.
- Validação estrita de schemas de dados com TypeScript.
- Controle de acesso com rotas protegidas e regras declarativas de Firestore.
